# Project Before & After Pairs — Implementation Plan

## Goal
1. Add per-project before/after pairs displayed in a 2-column grid below the project description
2. Add the founders photo (`/kylekc.png`) to the CTA section on project detail pages

---

## 1. Supabase Migration (`012_project_before_after.sql`)

The existing `before_after_pairs` table is for the homepage. We need a new table that links pairs to specific projects.

```sql
CREATE TABLE IF NOT EXISTS project_before_after (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_before_after ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view project_before_after"
  ON project_before_after FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage project_before_after"
  ON project_before_after FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX idx_project_before_after_project_id ON project_before_after(project_id);
```

---

## 2. Admin — Project Before/After Management

**Option A:** Add a "Before & After" tab/section to the existing project edit page  
**Option B:** Add a section in the Media admin page filtered by project

**Recommended: Option A** — Add a collapsible section or tab in the project editor.

- Fetch pairs from `project_before_after` WHERE `project_id` matches
- Reuse similar UI patterns from `BeforeAfterUpload` (add, delete, reorder, replace images)
- Each pair: before/after image upload, optional title, reorder arrows, delete

---

## 3. Public Project Detail Page (`/projects/[slug]/page.tsx`)

### Before/After Grid (below description)
- Fetch `project_before_after` rows for the current project
- Render in a **2-column grid** of `BeforeAfterSlider` components
- Each slider shows its optional title above
- Only render the section if pairs exist

### CTA Section Update
- Add the `/kylekc.png` founders photo to the CTA section
- Display it as a circular or rounded image next to or above the CTA text
- Gives a personal touch to the "Interested in a Similar Project?" section

---

## 4. File Changes Summary

| File | Action |
|---|---|
| `supabase/migrations/012_project_before_after.sql` | **Create** — new table linked to projects |
| `src/app/projects/[slug]/page.tsx` | **Update** — fetch & render before/after grid + add founders photo to CTA |
| `src/components/admin/project-before-after.tsx` | **Create** — admin component for managing per-project pairs |
| `src/app/admin/projects/[id]/page.tsx` (or similar) | **Update** — integrate the new admin component |
| `src/components/before-after-slider.tsx` | **No change** — reused as-is |
