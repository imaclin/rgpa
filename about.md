# About Page Admin Management Plan

## Goal
Allow admin users to manage the About page content — specifically the intro text and "Our Process" steps — through the admin panel. Process step cards should also support background images (upload or URL), similar to the service cards on the home page.

---

## 1. Database Migration (`supabase/migrations/009_about_page.sql`)

### `about_process_steps` table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| sort_order | INTEGER | Controls display order |
| step_number | TEXT | e.g. "01", "02" |
| title | TEXT NOT NULL | Step title |
| description | TEXT NOT NULL | Step description |
| icon | TEXT DEFAULT 'Search' | Lucide icon name string |
| bg_image | TEXT | Optional background image URL |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

### `about_content` table (key-value for intro text)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| key | TEXT UNIQUE NOT NULL | e.g. `intro_paragraph_1`, `intro_paragraph_2` |
| value | TEXT NOT NULL | The content |

### RLS
- Public read for both tables
- Authenticated users can manage both tables

### Seed Data
- Insert the 6 existing process steps with their current titles, descriptions, and icon names
- Insert the 2 intro paragraphs as key-value pairs

---

## 2. Admin Sidebar & Middleware

- Add "About" nav item to admin sidebar (use `Info` or `FileText` icon)
- Add `/about` to `adminRoutes` in middleware

---

## 3. Admin About Page (`/admin/about`)

Single page with two sections:

### Intro Text Section
- Two textarea fields for the intro paragraphs
- Save button

### Process Steps Section
- List of process step cards, sortable by drag (or manual sort_order)
- Each card shows: icon, step number, title
- Click to expand/edit inline or navigate to edit
- "Add Step" button

### Process Step Edit (inline or expandable)
Each step has:
- **Step Number** — text input (e.g. "01")
- **Title** — text input
- **Description** — textarea
- **Icon** — dropdown of Lucide icon names
- **Background Image** — URL input + upload button (same pattern as services)
- **Delete** button with confirmation

### Save & Delete
- Save all changes with a single "Save" button
- Individual delete per step with confirmation dialog

---

## 4. Public About Page Updates (`/src/app/about/page.tsx`)

- Remove hardcoded `process` array
- Fetch `about_process_steps` from Supabase ordered by `sort_order`
- Fetch `about_content` for intro paragraphs
- Map icon name strings to Lucide components using existing `getIcon()` helper
- Add B&W background images to process step cards (same pattern as home page service cards)
- Render intro text from DB instead of hardcoded strings

---

## 5. Files Changed

| File | Action |
|------|--------|
| `supabase/migrations/009_about_page.sql` | New — migration + seed |
| `src/components/admin/sidebar.tsx` | Edit — add About nav item |
| `src/middleware.ts` | Edit — add `/about` to adminRoutes |
| `src/app/admin/about/page.tsx` | New — admin about management page |
| `src/app/about/page.tsx` | Edit — fetch from DB, add bg images to cards |

---

## 6. Test & Push
- Run migration in Supabase SQL editor
- Verify admin page loads and saves correctly
- Verify public about page renders from DB
- Commit & push
