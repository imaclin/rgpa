# Before & After — Multiple Pairs Implementation Plan

## Current State
- Single before/after pair stored in `site_settings` as two key-value rows (`before_after_before_image`, `before_after_after_image`)
- Admin: `BeforeAfterUpload` component lets you upload one before + one after image
- Home page: fetches the two keys from `site_settings` and renders a single `BeforeAfterSlider`

## Goal
- Support **unlimited** before/after pairs, each with a before image, after image, and optional title
- Admin can add, reorder, and delete pairs
- Home page cycles through pairs via small left/right arrow buttons below the slider

---

## 1. Supabase Migration (`011_before_after_pairs.sql`)

```sql
CREATE TABLE IF NOT EXISTS before_after_pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE before_after_pairs ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public can view before_after_pairs"
  ON before_after_pairs FOR SELECT USING (true);

-- Authenticated manage
CREATE POLICY "Authenticated users can manage before_after_pairs"
  ON before_after_pairs FOR ALL USING (auth.role() = 'authenticated');

-- Migrate existing pair from site_settings into the new table
INSERT INTO before_after_pairs (title, before_image, after_image, display_order)
SELECT
  'Default',
  (SELECT value FROM site_settings WHERE key = 'before_after_before_image'),
  (SELECT value FROM site_settings WHERE key = 'before_after_after_image'),
  0
WHERE EXISTS (SELECT 1 FROM site_settings WHERE key = 'before_after_before_image')
  AND EXISTS (SELECT 1 FROM site_settings WHERE key = 'before_after_after_image');
```

---

## 2. Admin — Rewrite `BeforeAfterUpload` Component

**File:** `src/components/admin/before-after-upload.tsx`

- Fetch all rows from `before_after_pairs` ordered by `display_order`
- Render a list of pairs, each showing:
  - Thumbnail previews of before + after
  - Optional title input
  - Replace before / Replace after buttons
  - Delete pair button
  - Drag handle or up/down arrows for reordering
- "Add New Pair" button at the bottom
  - Opens inline form with before + after upload slots and optional title
  - On save → insert row into `before_after_pairs`
- Reorder saves updated `display_order` values to Supabase

---

## 3. Home Page — Carousel Navigation

**File:** `src/app/page.tsx`

- Fetch all `before_after_pairs` ordered by `display_order`
- Pass the array to a new wrapper component

**New component:** `src/components/before-after-carousel.tsx`

- Accepts `pairs: { id, title, before_image, after_image }[]`
- State: `activeIndex` (default 0)
- Renders:
  - `BeforeAfterSlider` with `pairs[activeIndex].before_image` / `after_image`
  - Below the slider: left arrow `<` and right arrow `>` buttons (small, centered)
  - Optional: dot indicators or "1 / 3" counter between arrows
  - Optional: pair title above or below slider
- Left arrow decrements `activeIndex` (wraps to last)
- Right arrow increments `activeIndex` (wraps to first)
- Arrows disabled / hidden if only 1 pair

---

## 4. Cleanup

- Remove old `site_settings` keys (`before_after_before_image`, `before_after_after_image`) from the migration or mark as deprecated
- Remove fallback default URLs from `page.tsx`

---

## File Changes Summary

| File | Action |
|---|---|
| `supabase/migrations/011_before_after_pairs.sql` | **Create** — new table + migrate existing data |
| `src/components/admin/before-after-upload.tsx` | **Rewrite** — multi-pair CRUD UI |
| `src/components/before-after-carousel.tsx` | **Create** — carousel wrapper with arrows |
| `src/app/page.tsx` | **Update** — fetch from new table, use carousel component |
| `src/components/before-after-slider.tsx` | **No change** — reused as-is |
