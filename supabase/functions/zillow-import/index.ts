import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generateSlug(address: string, city: string): string {
  return `${address}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function upgradePhotoUrl(url: string): string {
  return url
    .replace(/cc_ft_\d+/, "cc_ft_1536")
    .replace(/uncropped_scaled_within_\d+_\d+/, "uncropped_scaled_within_1536_1024");
}

// Mode 1: Scrape via Firecrawl (requires FIRECRAWL_API_KEY)
async function scrapeViaFirecrawl(zillowUrl: string) {
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!firecrawlKey) {
    throw new Error("FIRECRAWL_API_KEY not configured");
  }

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firecrawlKey}`,
    },
    body: JSON.stringify({
      url: zillowUrl,
      waitFor: 8000,
      formats: [
        {
          type: "json",
          prompt:
            "Extract: address, city, state, zip, price (number), beds (number), baths (number), sqft (number), year_built (number), property_type, description (full text), listing_status (for sale, sold, pending, not for sale), all photo_urls (array of high resolution image URLs from zillowstatic.com).",
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Firecrawl error: ${response.status} - ${err}`);
  }

  const result = await response.json();
  const data = result?.data?.json || {};

  // Upgrade photo URLs to high-res
  const photoUrls = (data.photo_urls || []).map((u: string) =>
    upgradePhotoUrl(u)
  );

  return {
    address: data.address || "",
    city: data.city || "",
    state: data.state || "OH",
    zip: data.zip || "",
    price: data.price || null,
    beds: data.beds || 0,
    baths: data.baths || 0,
    sqft: data.sqft || null,
    year_built: data.year_built || null,
    property_type: data.property_type || "Residential",
    description: data.description || "",
    listing_status: data.listing_status || "completed",
    photo_urls: photoUrls,
    source_url: zillowUrl,
  };
}

// Save listing data to Supabase
async function saveToSupabase(listing: any) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const slug = generateSlug(listing.address, listing.city);

  // Normalize listing status for listing imports.
  // New imported listings should be one of: for-sale, for-rent, sold.
  let status = "for-sale";
  const ls = (listing.listing_status || "").toLowerCase();
  if (ls.includes("rent")) status = "for-rent";
  else if (
    ls.includes("sold") ||
    ls.includes("not for sale") ||
    ls.includes("off market") ||
    ls.includes("pending")
  ) {
    status = "sold";
  }

  const { data: existing } = await supabase
    .from("properties")
    .select("id")
    .or(`slug.eq.${slug},website_url.eq.${listing.source_url}`)
    .maybeSingle();

  let propertyId: string;

  const propertyPayload = {
    title: `${listing.address}, ${listing.city}`,
    subtitle: `${listing.beds} bed · ${listing.baths} bath · ${listing.sqft ? listing.sqft.toLocaleString() + " sqft" : ""}`.trim(),
    slug,
    description: listing.description,
    category: "residential",
    status,
    location: `${listing.city}, ${listing.state} ${listing.zip}`.trim(),
    year: listing.year_built || new Date().getFullYear(),
    sq_footage: listing.sqft,
    website_url: listing.source_url,
    featured: false,
    featured_image_url: listing.photo_urls?.[0] || null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("properties")
      .update(propertyPayload)
      .eq("id", existing.id);
    if (error) throw error;
    propertyId = existing.id;
  } else {
    const { data: newProp, error } = await supabase
      .from("properties")
      .insert(propertyPayload)
      .select("id")
      .single();
    if (error) throw error;
    propertyId = newProp.id;
  }

  if (listing.photo_urls && listing.photo_urls.length > 0) {
    await supabase.from("media").delete().eq("property_id", propertyId);

    const mediaRows = listing.photo_urls.map((photoUrl: string, index: number) => ({
      property_id: propertyId,
      url: photoUrl,
      type: "image",
      alt_text: `${listing.address} - Photo ${index + 1}`,
      sort_order: index,
    }));

    const { error: mediaError } = await supabase
      .from("media")
      .insert(mediaRows);
    if (mediaError) {
      console.error("Media insert error:", mediaError);
    }
  }

  return propertyId;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Mode 1: "scrape" - scrape via Firecrawl then save
    // Mode 2: "save" - receive pre-scraped data and save directly
    const mode = body.mode || "scrape";

    let listing: any;

    if (mode === "save") {
      // Data was already scraped (e.g., by MCP tool in chat)
      listing = body.listing;
      if (!listing || !listing.address) {
        return new Response(
          JSON.stringify({ error: "Missing listing data" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      // Scrape mode - requires Firecrawl API key
      const url = body.url;
      if (!url || !url.includes("zillow.com")) {
        return new Response(
          JSON.stringify({ error: "Please provide a valid Zillow URL" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      try {
        listing = await scrapeViaFirecrawl(url);
      } catch (e: any) {
        return new Response(
          JSON.stringify({
            error: e.message.includes("FIRECRAWL_API_KEY")
              ? "Firecrawl API key not configured. Add FIRECRAWL_API_KEY to your Supabase Edge Function secrets, or use chat-based import."
              : e.message,
          }),
          {
            status: 422,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const propertyId = await saveToSupabase(listing);

    return new Response(
      JSON.stringify({
        success: true,
        property_id: propertyId,
        listing,
        photo_count: listing.photo_urls?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Zillow import error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to import property" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
