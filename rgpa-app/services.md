# Services Admin Management Plan

## Goal
Allow services to be managed through the admin panel, replacing all hardcoded service data on the home page and services page with dynamic data from Supabase.

---

## 1. Database Migration (`supabase/migrations/008_services.sql`)

Create a `services` table:

```sql
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,

  -- Home page fields (card in services grid)
  home_title TEXT NOT NULL,
  home_description TEXT NOT NULL,
  home_icon TEXT NOT NULL DEFAULT 'Building2',  -- lucide icon name
  home_bg_image TEXT,                           -- URL or uploaded image path

  -- Services page fields (large card with image)
  services_title TEXT NOT NULL,
  services_description TEXT NOT NULL,
  services_features TEXT[] DEFAULT '{}',        -- array of feature strings
  services_image TEXT,                          -- URL or uploaded image path

  -- Service detail page fields
  detail_hero_description TEXT,
  detail_benefits JSONB DEFAULT '[]',           -- [{title, description}]
  detail_faqs JSONB DEFAULT '[]',              -- [{question, answer}]
  detail_cta_title TEXT,
  detail_cta_description TEXT,

  -- SEO fields
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view services"
  ON services FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL USING (auth.role() = 'authenticated');
```

**Seed with existing data** from the 4 current services (commercial-building-restoration, interior-design, project-consultation, property-acquisition) so nothing is lost.

---

## 2. Admin Pages

### a. Services List Page (`/admin/services`)
- List all services in a sortable list (drag to reorder like projects)
- Each row shows: icon, home_title, slug
- "New Service" button

### b. Service Detail/Edit Page (`/admin/services/[id]`)
- **Tab switcher** with 3 tabs:
  - **Home Page** — edit `home_title`, `home_description`, `home_icon` (dropdown of lucide icons), `home_bg_image` (upload or paste URL)
  - **Services Page** — edit `services_title`, `services_description`, `services_features` (add/remove list), `services_image` (upload or paste URL)
  - **Detail Page** — edit `detail_hero_description`, `detail_benefits` (add/remove list of {title, description}), `detail_faqs` (add/remove list of {question, answer}), `detail_cta_title`, `detail_cta_description`
- **SEO section** (collapsible, shared across tabs): `seo_title`, `seo_description`, `seo_keywords`
- **Slug** field (auto-generated from title, editable)
- Image fields support **upload to Supabase storage** OR **paste an external URL**
- Save button, Delete button with confirmation

---

## 3. Admin Sidebar & Middleware
- Add "Services" nav item to admin sidebar (use `Wrench` or `Briefcase` icon)
- Add `/services` to `adminRoutes` in middleware

---

## 4. Public Page Updates

### a. Home Page (`/src/app/page.tsx`)
- Remove hardcoded `services` array
- Fetch services from Supabase, ordered by `sort_order`
- Render cards using `home_title`, `home_description`, `home_icon`, `home_bg_image`
- Map icon name string to actual lucide component

### b. Services Page (`/src/app/services/page.tsx`)
- Remove hardcoded `services` array
- Fetch services from Supabase, ordered by `sort_order`
- Render using `services_title`, `services_description`, `services_features`, `services_image`
- Link to `/services/[slug]`

### c. Service Detail Pages (`/src/app/services/[slug]/page.tsx`)
- Replace the 4 static pages with a single **dynamic route**
- Fetch service by slug from Supabase
- Render `detail_hero_description`, `detail_benefits`, `detail_faqs`, `detail_cta_title`, `detail_cta_description`
- Generate metadata from SEO fields
- Delete the 4 static service subdirectories after migration

---

## 5. Execution Order

1. **Migration** — Create table + seed existing data
2. **Admin services list page** — `/admin/services`
3. **Admin service edit page** — `/admin/services/[id]` with tabs
4. **Sidebar + middleware** — Add nav item and route
5. **Dynamic public detail page** — `/services/[slug]`
6. **Update services page** — Fetch from DB
7. **Update home page** — Fetch from DB
8. **Cleanup** — Remove static service subdirectories
9. **Test & push**
