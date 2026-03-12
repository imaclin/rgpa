#!/usr/bin/env python3
"""
Scrape a Realtor.com listing using Cloudflare Browser Rendering and import into Supabase.

Usage:
    python scrape_realtor.py <realtor_url>

Example:
    python scrape_realtor.py "https://www.realtor.com/realestateandhomes-detail/25530-Hilliard-Blvd_Westlake_OH_44145_M40949-88769"

Requirements:
    pip install -r requirements.txt

Environment variables (reads from ../.env.local):
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
    CLOUDFLARE_ACCOUNT_ID
    CLOUDFLARE_API_TOKEN
"""

import sys
import os
import re
import json
import unicodedata
from pathlib import Path
from html.parser import HTMLParser

import requests
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(env_path)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
CF_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
CF_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")

missing = []
if not SUPABASE_URL:
    missing.append("NEXT_PUBLIC_SUPABASE_URL")
if not SUPABASE_KEY:
    missing.append("SUPABASE_SERVICE_ROLE_KEY")
if not CF_ACCOUNT_ID:
    missing.append("CLOUDFLARE_ACCOUNT_ID")
if not CF_API_TOKEN:
    missing.append("CLOUDFLARE_API_TOKEN")
if missing:
    print(f"ERROR: Missing env vars in .env.local: {', '.join(missing)}")
    sys.exit(1)

CF_BASE = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/browser-rendering"
CF_HEADERS = {
    "Authorization": f"Bearer {CF_API_TOKEN}",
    "Content-Type": "application/json",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    """Generate a URL-friendly slug from text."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-")


def extract_number(text: str | None) -> int | None:
    """Pull the first integer out of a string like '3 bed' or '1,500 sqft'."""
    if not text:
        return None
    m = re.search(r"[\d,]+", text)
    return int(m.group().replace(",", "")) if m else None


def first_text(results: list[dict], default: str = "") -> str:
    """Return the .text of the first result from a CF /scrape selector group."""
    if results and results[0].get("text"):
        return results[0]["text"].strip()
    return default


def all_attrs(results: list[dict], attr_name: str) -> list[str]:
    """Collect a specific attribute value from all CF /scrape results."""
    out = []
    for r in results:
        for a in r.get("attributes", []):
            if a.get("name") == attr_name and a.get("value"):
                out.append(a["value"])
    return out


# ---------------------------------------------------------------------------
# Cloudflare Browser Rendering  —  /crawl endpoint (async, single page)
# ---------------------------------------------------------------------------

def cf_crawl(url: str) -> dict:
    """
    Use the CF /crawl endpoint to render a single page.
    Returns the first completed record with 'html' and 'markdown' keys.
    """
    import time as _time

    payload = {
        "url": url,
        "limit": 1,
        "formats": ["html", "markdown"],
    }
    print("  Starting CF /crawl job...")
    resp = None
    for attempt in range(3):
        resp = requests.post(f"{CF_BASE}/crawl", headers=CF_HEADERS, json=payload, timeout=30)
        if resp.status_code == 429:
            retry_after = resp.headers.get("Retry-After")
            wait = int(retry_after) if retry_after and retry_after.isdigit() else 10 * (attempt + 1)
            print(f"  Rate limited (429). Waiting {wait}s (Retry-After: {retry_after})...")
            _time.sleep(wait)
            continue
        if resp.status_code >= 400:
            print(f"  CF API error {resp.status_code}: {resp.text[:500]}")
        break
    resp.raise_for_status()
    data = resp.json()
    if not data.get("success"):
        raise RuntimeError(f"CF /crawl start error: {data}")
    job_id = data["result"]
    print(f"  Job ID: {job_id}")

    # Poll for completion (lightweight)
    poll_url = f"{CF_BASE}/crawl/{job_id}?limit=1"
    for i in range(60):
        _time.sleep(5)
        poll = requests.get(poll_url, headers=CF_HEADERS, timeout=30)
        poll.raise_for_status()
        result = poll.json().get("result", {})
        status = result.get("status", "unknown")
        finished = result.get("finished", 0)
        total = result.get("total", 0)
        print(f"  Poll {i+1}: status={status}  finished={finished}/{total}")

        if status == "completed":
            break
        elif status in ("errored", "cancelled_due_to_timeout",
                        "cancelled_due_to_limits", "cancelled_by_user"):
            raise RuntimeError(f"CF crawl job failed: {status}")
        elif status != "running":
            raise RuntimeError(f"CF crawl unexpected status: {status}")
    else:
        raise RuntimeError("CF crawl timed out after 5 minutes")

    # Fetch full results
    full = requests.get(f"{CF_BASE}/crawl/{job_id}", headers=CF_HEADERS, timeout=30)
    full.raise_for_status()
    records = full.json().get("result", {}).get("records", [])
    for rec in records:
        if rec.get("status") == "completed":
            return rec
    return records[0] if records else {}


# ---------------------------------------------------------------------------
# Scraping
# ---------------------------------------------------------------------------

def scrape_listing(url: str) -> dict:
    """Scrape a Realtor.com listing page and return structured data."""
    print(f"Fetching: {url}")

    record = cf_crawl(url)
    page_html = record.get("html", "")
    page_markdown = record.get("markdown", "")

    # --- Primary: parse __NEXT_DATA__ JSON blob ----------------------------
    # Realtor.com is a Next.js app; all listing data lives here.
    nd_match = re.search(
        r'<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)</script>', page_html, re.I
    )
    pd = {}
    if nd_match:
        try:
            nd = json.loads(nd_match.group(1))
            pd = (
                nd.get("props", {})
                .get("pageProps", {})
                .get("initialReduxState", {})
                .get("propertyDetails", {})
            )
            print("  Parsed __NEXT_DATA__ successfully")
        except (json.JSONDecodeError, KeyError) as e:
            print(f"  Warning: could not parse __NEXT_DATA__: {e}")

    desc_obj = pd.get("description", {}) if isinstance(pd.get("description"), dict) else {}
    loc_obj = pd.get("location", {}) if isinstance(pd.get("location"), dict) else {}
    addr_obj = loc_obj.get("address", {}) if isinstance(loc_obj.get("address"), dict) else {}

    # --- Address -----------------------------------------------------------
    street = addr_obj.get("line", "")
    city = addr_obj.get("city", "")
    state = addr_obj.get("state_code", "")
    zipcode = addr_obj.get("postal_code", "")

    # Fallback: parse from HTML <h1>
    if not street:
        h1_html = re.search(r"<h1[^>]*>([^<]+)</h1>", page_html, re.I)
        if h1_html:
            full_address = h1_html.group(1).strip()
            parts = [p.strip() for p in full_address.split(",")]
            street = parts[0] if len(parts) >= 1 else full_address
            city = city or (parts[1] if len(parts) >= 2 else "")
            state_zip = parts[2].strip() if len(parts) >= 3 else ""
            state = state or (state_zip.split()[0] if state_zip else "")
            zipcode = zipcode or (state_zip.split()[1] if len(state_zip.split()) > 1 else "")

    # --- Key facts ---------------------------------------------------------
    beds = desc_obj.get("beds")
    baths = desc_obj.get("baths_consolidated") or desc_obj.get("baths_total")
    sqft = desc_obj.get("sqft")
    year_built = desc_obj.get("year_built")
    price = pd.get("list_price")

    # Fallback: regex on HTML text
    page_text = page_html
    if beds is None:
        m = re.search(r"(\d+)\s*bed", page_text, re.I)
        if m:
            beds = int(m.group(1))
    if baths is None:
        m = re.search(r"([\d.]+)\s*bath", page_text, re.I)
        if m:
            baths = float(m.group(1))
            baths = int(baths) if baths == int(baths) else baths
    if sqft is None:
        m = re.search(r"([\d,]+)\s*(?:sq\s*ft|sqft)", page_text, re.I)
        if m:
            sqft = int(m.group(1).replace(",", ""))
    if year_built is None:
        m = re.search(r"(?:year\s*built|built\s*in)[:\s]*(\d{4})", page_text, re.I)
        if m:
            year_built = int(m.group(1))
    if price is None:
        m = re.search(r"\$\s*([\d,]+)", page_text)
        if m:
            price = int(m.group(1).replace(",", ""))

    # --- Description -------------------------------------------------------
    description = desc_obj.get("text", "") or ""

    # --- Status ------------------------------------------------------------
    status_raw = pd.get("status", "")
    status_map = {
        "for_sale": "for sale",
        "for_rent": "for rent",
        "sold": "sold",
        # Treat pending / off-market as sold-like for downstream status mapping.
        "pending": "sold",
        "off_market": "sold",
    }
    status_text = status_map.get(status_raw, status_raw.replace("_", " ") if status_raw else "")

    # --- Photos ------------------------------------------------------------
    MAX_PHOTOS = 50
    photo_urls = []
    seen_bases = set()
    photo_count = pd.get("photo_count", 0) or 0
    target_photo_limit = min(photo_count, MAX_PHOTOS) if isinstance(photo_count, int) and photo_count > 0 else MAX_PHOTOS

    def photo_key(img_url: str) -> str:
        """Create a stable dedupe key so rdcpix size variants count as the same photo."""
        base = img_url.split("?")[0].lower()
        if "rdcpix.com" in base:
            base = re.sub(r"(rd|od)-w\d+_h\d+\.(webp|jpg|jpeg|png)$", "", base)
            base = re.sub(r"s\.jpg$", "", base)
        return base

    def add_photo(img_url: str) -> bool:
        if len(photo_urls) >= target_photo_limit:
            return False
        key = photo_key(img_url)
        if key not in seen_bases and img_url.startswith("http"):
            seen_bases.add(key)
            photo_urls.append(img_url)
        return True

    def is_relevant_listing_photo(img_url: str) -> bool:
        if not isinstance(img_url, str) or not img_url.startswith("http"):
            return False

        base = img_url.split("?")[0].lower()
        if "rdcpix.com" not in base:
            return False

        # Skip tiny thumbnail derivatives often used for agent/profile imagery.
        if re.search(r"-c\d+[a-z]?\.", base):
            return False

        return True

    def pick_best_main_photo(img_url: str) -> str:
        """Prefer a higher-resolution rdcpix variant when available."""
        if not isinstance(img_url, str) or not img_url:
            return img_url
        if "rdcpix.com" not in img_url:
            return img_url

        base = img_url.split("?")[0]
        candidates = [base]
        if base.endswith("s.jpg"):
            stem = base[:-5]
            candidates = [
                f"{stem}rd-w960_h720.webp",
                f"{stem}od-w640_h480.jpg",
                base,
            ]

        for candidate in candidates:
            try:
                resp = requests.head(candidate, timeout=8, allow_redirects=True)
                if resp.status_code == 405:
                    resp = requests.get(candidate, timeout=8, allow_redirects=True, stream=True)
                if 200 <= resp.status_code < 300:
                    ctype = (resp.headers.get("Content-Type") or "").lower()
                    if "image" in ctype or not ctype:
                        return candidate
            except requests.RequestException:
                continue
        return base

    # 1) Start with the main image from structured data.
    primary = pd.get("primary_photo", {})
    primary_url = primary.get("href") if isinstance(primary, dict) else None

    # Fallback to first photo entry in __NEXT_DATA__ if primary is missing.
    if not primary_url:
        nd_photos = pd.get("photos", [])
        if isinstance(nd_photos, list) and nd_photos:
            first = nd_photos[0]
            primary_url = first.get("href") if isinstance(first, dict) else first

    if isinstance(primary_url, str) and primary_url:
        add_photo(pick_best_main_photo(primary_url))

    # 2) Prefer gallery images from the fullscreen photos container.
    gallery_fragment = ""
    fullscreen_idx = page_html.lower().find('data-testid="fullscreen-photos"')
    if fullscreen_idx != -1:
        # Keep a bounded slice to avoid scanning the whole document repeatedly.
        gallery_fragment = page_html[fullscreen_idx:fullscreen_idx + 600_000]

    gallery_candidates = []
    if gallery_fragment:
        gallery_candidates = re.findall(
            r"https?://[^\"'\s>]+rdcpix\.com[^\"'\s>]+(?:\.jpg|\.jpeg|\.webp|\.png)(?:\?[^\"'\s>]*)?",
            gallery_fragment,
            re.I,
        )

    for candidate in gallery_candidates:
        if not is_relevant_listing_photo(candidate):
            continue
        if not add_photo(pick_best_main_photo(candidate)):
            break

    # 3) Fallback: use markdown output ordering from CF crawl.
    # In practice, listing gallery images are emitted first in markdown.
    if len(photo_urls) <= 1 and isinstance(page_markdown, str) and page_markdown:
        markdown_candidates = re.findall(
            r"https?://[^\s)\"]+rdcpix\.com[^\s)\"]+(?:\.jpg|\.jpeg|\.webp|\.png)(?:\?[^\s)\"]*)?",
            page_markdown,
            re.I,
        )

        # Keep crawl ordering and bound candidate scanning to avoid nearby non-listing content.
        md_scan_limit = max(target_photo_limit * 3, target_photo_limit)
        for candidate in markdown_candidates[:md_scan_limit]:
            if not is_relevant_listing_photo(candidate):
                continue
            if not add_photo(pick_best_main_photo(candidate)):
                break

    # 4) Last fallback: scan full HTML for rdcpix URLs.
    if len(photo_urls) <= 1:
        all_candidates = re.findall(
            r"https?://[^\"'\s>]+rdcpix\.com[^\"'\s>]+(?:\.jpg|\.jpeg|\.webp|\.png)(?:\?[^\"'\s>]*)?",
            page_html,
            re.I,
        )
        html_scan_limit = max(target_photo_limit * 4, target_photo_limit)
        for candidate in all_candidates[:html_scan_limit]:
            if not is_relevant_listing_photo(candidate):
                continue
            if not add_photo(pick_best_main_photo(candidate)):
                break

    # Fallback: og:image
    if not photo_urls:
        og_match = re.search(r'og:image["\s]+content="([^"]+)"', page_html, re.I)
        if og_match:
            add_photo(og_match.group(1))

    listing = {
        "address": street,
        "city": city,
        "state": state,
        "zip": zipcode,
        "beds": beds,
        "baths": baths,
        "sqft": sqft,
        "year_built": year_built,
        "price": price,
        "description": description,
        "listing_status": status_text,
        "photo_urls": photo_urls,
        "source_url": url,
    }

    print(f"\n--- Scraped Listing ---")
    print(f"  Address:  {street}, {city}, {state} {zipcode}")
    print(f"  Beds:     {beds}")
    print(f"  Baths:    {baths}")
    print(f"  Sqft:     {sqft}")
    print(f"  Year:     {year_built}")
    print(f"  Price:    ${price:,}" if price else "  Price:    N/A")
    print(f"  Status:   {status_text or 'unknown'}")
    print(f"  Photos:   {len(photo_urls)}  (page reports {photo_count})")
    print(f"  Desc:     {description[:120]}..." if len(description) > 120 else f"  Desc:     {description}")

    return listing


# ---------------------------------------------------------------------------
# Supabase Import
# ---------------------------------------------------------------------------

def import_to_supabase(listing: dict) -> str:
    """Insert or update the listing in Supabase, matching the zillow-import schema."""
    from supabase import create_client

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    slug = slugify(f"{listing['address']}-{listing['city']}")

    # Normalize status for listing imports.
    # New imported listings should be one of: for-sale, for-rent, sold.
    ls = (listing.get("listing_status") or "").lower().strip()
    if "rent" in ls:
        status = "for-rent"
    elif "sold" in ls or "not for sale" in ls or "off market" in ls or "pending" in ls:
        status = "sold"
    else:
        status = "for-sale"

    subtitle_parts = []
    if listing["beds"]:
        subtitle_parts.append(f"{listing['beds']} bed")
    if listing["baths"]:
        subtitle_parts.append(f"{listing['baths']} bath")
    if listing["sqft"]:
        subtitle_parts.append(f"{listing['sqft']:,} sqft")

    payload = {
        "title": f"{listing['address']}, {listing['city']}",
        "subtitle": " · ".join(subtitle_parts),
        "slug": slug,
        "description": listing["description"] or None,
        "category": "residential",
        "status": status,
        "location": f"{listing['city']}, {listing['state']} {listing['zip']}".strip(),
        "year": listing["year_built"] or None,
        "sq_footage": listing["sqft"],
        "website_url": listing["source_url"],
        "featured": False,
        "featured_image_url": listing["photo_urls"][0] if listing["photo_urls"] else None,
    }

    # Check for existing property
    existing = (
        supabase.table("properties")
        .select("id")
        .or_(f"slug.eq.{slug},website_url.eq.{listing['source_url']}")
        .limit(1)
        .execute()
    )

    if existing.data:
        property_id = existing.data[0]["id"]
        supabase.table("properties").update(payload).eq("id", property_id).execute()
        print(f"\nUpdated existing property: {property_id}")
    else:
        result = supabase.table("properties").insert(payload).execute()
        property_id = result.data[0]["id"]
        print(f"\nCreated new property: {property_id}")

    # Import photos
    if listing["photo_urls"]:
        # Delete old media first
        supabase.table("media").delete().eq("property_id", property_id).execute()

        media_rows = [
            {
                "property_id": property_id,
                "url": photo_url,
                "type": "image",
                "alt_text": f"{listing['address']} - Photo {i + 1}",
                "sort_order": i,
            }
            for i, photo_url in enumerate(listing["photo_urls"])
        ]

        supabase.table("media").insert(media_rows).execute()
        print(f"Imported {len(media_rows)} photos")

    return property_id


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) < 2:
        print("Usage: python scrape_realtor.py <realtor_url>")
        print('Example: python scrape_realtor.py "https://www.realtor.com/realestateandhomes-detail/..."')
        sys.exit(1)

    url = sys.argv[1]

    if "realtor.com" not in url:
        print("WARNING: This script is designed for realtor.com URLs. Proceeding anyway...")

    listing = scrape_listing(url)

    if not listing["address"]:
        print("\nERROR: Could not extract address from the page. The page may have loaded differently.")
        print("Try running again or check the URL.")
        sys.exit(1)

    property_id = import_to_supabase(listing)
    print(f"\nDone! Property ID: {property_id}")
    print(f"View in admin: /admin/properties/{property_id}")


if __name__ == "__main__":
    main()
