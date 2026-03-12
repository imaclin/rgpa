import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Vercel: allow up to 5 minutes for the crawl job to complete
export const maxDuration = 300

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const CF_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/browser-rendering`
const CF_HEADERS = {
  Authorization: `Bearer ${CF_API_TOKEN}`,
  "Content-Type": "application/json",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-|-$/g, "")
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Cloudflare Browser Rendering — /crawl endpoint
// ---------------------------------------------------------------------------

async function cfCrawl(url: string): Promise<{ html: string }> {
  const payload = { url, limit: 1, formats: ["html", "markdown"] }

  let jobId: string | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await fetch(`${CF_BASE}/crawl`, {
      method: "POST",
      headers: CF_HEADERS,
      body: JSON.stringify(payload),
    })

    if (resp.status === 429) {
      const retryAfter = resp.headers.get("Retry-After")
      const wait = retryAfter ? parseInt(retryAfter) * 1000 : (attempt + 1) * 10000
      await sleep(wait)
      continue
    }

    const data = await resp.json()
    if (!data.success) throw new Error(`CF /crawl start error: ${JSON.stringify(data)}`)
    jobId = data.result
    break
  }

  if (!jobId) throw new Error("Failed to start Cloudflare crawl job after retries")

  // Poll for completion (max 5 minutes, every 5 seconds)
  const pollUrl = `${CF_BASE}/crawl/${jobId}?limit=1`
  for (let i = 0; i < 60; i++) {
    await sleep(5000)
    const poll = await fetch(pollUrl, { headers: CF_HEADERS })
    const data = await poll.json()
    const result = data.result || {}
    const status: string = result.status || "unknown"

    if (status === "completed") break
    if (["errored", "cancelled_due_to_timeout", "cancelled_due_to_limits", "cancelled_by_user"].includes(status)) {
      throw new Error(`CF crawl job failed: ${status}`)
    }
    if (status !== "running") throw new Error(`CF crawl unexpected status: ${status}`)

    if (i === 59) throw new Error("CF crawl timed out after 5 minutes")
  }

  // Fetch full results
  const full = await fetch(`${CF_BASE}/crawl/${jobId}`, { headers: CF_HEADERS })
  const fullData = await full.json()
  const records: any[] = fullData.result?.records || []
  const record = records.find((r) => r.status === "completed") || records[0] || {}
  return { html: record.html || "" }
}

// ---------------------------------------------------------------------------
// Photo URL high-res upgrade (mirrors pick_best_main_photo in scrape_realtor.py)
// ---------------------------------------------------------------------------

async function pickBestMainPhoto(imgUrl: string): Promise<string> {
  if (!imgUrl || !imgUrl.includes("rdcpix.com")) return imgUrl

  const base = imgUrl.split("?")[0]
  let candidates: string[] = [base]

  if (base.endsWith("s.jpg")) {
    const stem = base.slice(0, -5)
    candidates = [
      `${stem}rd-w960_h720.webp`,
      `${stem}od-w640_h480.jpg`,
      base,
    ]
  }

  for (const candidate of candidates) {
    try {
      let resp = await fetch(candidate, { method: "HEAD" })
      if (resp.status === 405) {
        resp = await fetch(candidate, { method: "GET" })
      }
      if (resp.ok) {
        const ct = resp.headers.get("content-type") || ""
        if (!ct || ct.includes("image")) return candidate
      }
    } catch {
      continue
    }
  }

  return base
}

// ---------------------------------------------------------------------------
// Parse __NEXT_DATA__ and extract listing data
// ---------------------------------------------------------------------------

async function scrapeNextData(html: string, url: string) {
  const ndMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)
  let pd: any = {}
  if (ndMatch) {
    try {
      const nd = JSON.parse(ndMatch[1])
      pd = nd?.props?.pageProps?.initialReduxState?.propertyDetails || {}
    } catch {
      // fall through to regex fallbacks
    }
  }

  const descObj = typeof pd.description === "object" && pd.description ? pd.description : {}
  const locObj = typeof pd.location === "object" && pd.location ? pd.location : {}
  const addrObj = typeof locObj.address === "object" && locObj.address ? locObj.address : {}

  // Address
  let street: string = addrObj.line || ""
  let city: string = addrObj.city || ""
  let state: string = addrObj.state_code || ""
  let zipcode: string = addrObj.postal_code || ""

  if (!street) {
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    if (h1Match) {
      const parts = h1Match[1].split(",").map((p) => p.trim())
      street = parts[0] || ""
      city = city || parts[1] || ""
      const stateZip = parts[2]?.trim() || ""
      state = state || stateZip.split(" ")[0] || ""
      zipcode = zipcode || stateZip.split(" ")[1] || ""
    }
  }

  // Key facts
  let beds: number | null = descObj.beds ?? null
  let baths: number | null = descObj.baths_consolidated ?? descObj.baths_total ?? null
  let sqft: number | null = descObj.sqft ?? null
  let yearBuilt: number | null = descObj.year_built ?? null
  let price: number | null = pd.list_price ?? null

  if (beds === null) { const m = html.match(/(\d+)\s*bed/i); if (m) beds = parseInt(m[1]) }
  if (baths === null) { const m = html.match(/([\d.]+)\s*bath/i); if (m) baths = parseFloat(m[1]) }
  if (sqft === null) { const m = html.match(/([\d,]+)\s*(?:sq\s*ft|sqft)/i); if (m) sqft = parseInt(m[1].replace(/,/g, "")) }
  if (yearBuilt === null) { const m = html.match(/(?:year\s*built|built\s*in)[:\s]*(\d{4})/i); if (m) yearBuilt = parseInt(m[1]) }
  if (price === null) { const m = html.match(/\$([\d,]+)/); if (m) price = parseInt(m[1].replace(/,/g, "")) }

  const description: string = descObj.text || ""

  // Status
  const statusRaw: string = pd.status || ""
  const statusMap: Record<string, string> = {
    for_sale: "for sale", for_rent: "for rent", sold: "sold",
    pending: "sold", off_market: "sold",
  }
  const statusText = statusMap[statusRaw] ?? statusRaw.replace(/_/g, " ")

  // Photo: main photo only (same as Python script behavior)
  const photoUrls: string[] = []
  let primaryUrl: string | null = null

  if (typeof pd.primary_photo === "object" && pd.primary_photo?.href) {
    primaryUrl = pd.primary_photo.href
  }
  if (!primaryUrl && Array.isArray(pd.photos) && pd.photos.length > 0) {
    const first = pd.photos[0]
    primaryUrl = typeof first === "object" ? first?.href : first
  }
  if (!primaryUrl) {
    const ogMatch = html.match(/og:image["\s]+content="([^"]+)"/i)
    if (ogMatch) primaryUrl = ogMatch[1]
  }
  if (primaryUrl) photoUrls.push(await pickBestMainPhoto(primaryUrl))

  const photoCount: number = pd.photo_count || photoUrls.length

  return {
    address: street,
    city,
    state,
    zip: zipcode,
    beds,
    baths,
    sqft,
    year_built: yearBuilt,
    price,
    description,
    listing_status: statusText,
    photo_urls: photoUrls,
    photo_count: photoCount,
    source_url: url,
  }
}

// ---------------------------------------------------------------------------
// Supabase upsert
// ---------------------------------------------------------------------------

async function importToSupabase(listing: Awaited<ReturnType<typeof scrapeNextData>>) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const slug = slugify(`${listing.address}-${listing.city}`)

  // Normalize status
  const ls = (listing.listing_status || "").toLowerCase()
  const status = ls.includes("rent") ? "for-rent"
    : (ls.includes("sold") || ls.includes("off market") || ls.includes("pending")) ? "sold"
    : "for-sale"

  const subtitleParts: string[] = []
  if (listing.beds) subtitleParts.push(`${listing.beds} bed`)
  if (listing.baths) subtitleParts.push(`${listing.baths} bath`)
  if (listing.sqft) subtitleParts.push(`${listing.sqft.toLocaleString()} sqft`)

  const payload = {
    title: `${listing.address}, ${listing.city}`,
    subtitle: subtitleParts.join(" · "),
    slug,
    description: listing.description || null,
    category: "residential",
    status,
    location: `${listing.city}, ${listing.state} ${listing.zip}`.trim(),
    year: listing.year_built || null,
    sq_footage: listing.sqft,
    website_url: listing.source_url,
    featured: false,
    featured_image_url: listing.photo_urls[0] ?? null,
  }

  // Check for existing
  const { data: existing } = await supabase
    .from("properties")
    .select("id")
    .or(`slug.eq.${slug},website_url.eq.${listing.source_url}`)
    .limit(1)

  let propertyId: string
  if (existing && existing.length > 0) {
    propertyId = existing[0].id
    await supabase.from("properties").update(payload).eq("id", propertyId)
  } else {
    const { data: newProp, error } = await supabase.from("properties").insert(payload).select().single()
    if (error) throw new Error(`Failed to insert property: ${error.message}`)
    propertyId = newProp.id
  }

  // Insert media
  if (listing.photo_urls.length > 0) {
    await supabase.from("media").delete().eq("property_id", propertyId)
    const mediaRows = listing.photo_urls.map((url, i) => ({
      property_id: propertyId,
      url,
      type: "image",
      alt_text: `${listing.address} - Photo ${i + 1}`,
      sort_order: i,
    }))
    await supabase.from("media").insert(mediaRows)
  }

  return propertyId
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !url.includes("realtor.com")) {
      return NextResponse.json({ error: "Please provide a valid Realtor.com URL" }, { status: 400 })
    }

    if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
      return NextResponse.json({ error: "Cloudflare credentials not configured" }, { status: 500 })
    }

    const { html } = await cfCrawl(url)
    const listing = await scrapeNextData(html, url)

    if (!listing.address) {
      return NextResponse.json(
        { error: "Could not extract property address. The page may have loaded differently — please try again." },
        { status: 422 }
      )
    }

    const propertyId = await importToSupabase(listing)

    return NextResponse.json({
      success: true,
      property_id: propertyId,
      listing,
      photo_count: listing.photo_urls.length,
    })
  } catch (error: any) {
    console.error("Realtor import error:", error)
    return NextResponse.json({ error: error.message || "Failed to import property" }, { status: 500 })
  }
}
