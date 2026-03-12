# Scripts

## Realtor.com Scraper

Scrapes a Realtor.com listing page and imports it as a property into your Supabase database.

### Setup

```bash
cd scripts

# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Scrapling browser dependencies
scrapling install
```

### Usage

```bash
python scrape_realtor.py "<realtor_url>"
```

**Example:**

```bash
python scrape_realtor.py "https://www.realtor.com/realestateandhomes-detail/25530-Hilliard-Blvd_Westlake_OH_44145_M40949-88769"
```

### What it does

1. Uses Scrapling's `StealthyFetcher` to load the listing page (bypasses anti-bot)
2. Extracts: address, beds, baths, sqft, year built, price, description, photos
3. Creates or updates the property in Supabase (same schema as the Zillow import)
4. Imports all photos into the `media` table

### Environment Variables

The script reads from `../.env.local` automatically. Required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
