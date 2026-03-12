# Testimonials — Implementation Plan

## Overview
Create a new admin page for managing testimonials (CRUD with photo upload), update the existing `testimonials` table to include `photo_url` and `role` fields, and replace the hardcoded homepage testimonials section with a dynamic, auto-scrolling horizontal carousel fetched from the database.

---

## 1. Database Changes

### Migration: `007_testimonials_update.sql`

The existing `testimonials` table already has: `id`, `client_name`, `project_id`, `content`, `rating`, `featured`, `sort_order`, `created_at`.

**Add columns:**
| Column | Type | Notes |
|---|---|---|
| `photo_url` | TEXT | Profile photo URL (Supabase Storage) |
| `role` | TEXT | e.g. "Modern Residence Owner" |

**Seed data:** Insert 5-6 placeholder testimonials with names, roles, content, and placeholder avatar URLs.

---

## 2. File Structure

```
src/app/admin/testimonials/
└── page.tsx                    # Admin CRUD page for testimonials

src/components/
└── scrolling-testimonials.tsx  # Auto-scrolling horizontal carousel for homepage
```

---

## 3. Admin Page (`/admin/testimonials`)

**Features:**
- List all testimonials in a card grid
- Each card shows: photo, name, role, content preview, rating stars
- "Add Testimonial" button → opens dialog with:
  - Photo upload (file input → Supabase Storage)
  - Name (text)
  - Role/title (text)
  - Content (textarea)
  - Rating (1-5 select)
  - Featured toggle
- Edit existing testimonials (same dialog)
- Delete with confirmation
- Drag to reorder (sort_order)

---

## 4. Homepage Component (`ScrollingTestimonials`)

**Design:**
- Horizontal auto-scrolling strip (left to right, continuous loop)
- Each testimonial card shows:
  - Circular photo avatar
  - Quote content
  - Name + role below
- Pauses on hover
- CSS animation for smooth infinite scroll (duplicate items for seamless loop)
- Fetched server-side from Supabase

---

## 5. Sidebar Update

Add to navigation in `sidebar.tsx`:
```ts
{ name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote }
```

Add `/testimonials` to middleware `adminRoutes` array.

---

## 6. Implementation Order

| Step | Description | Files |
|---|---|---|
| **1** | Create migration `007_testimonials_update.sql` (add columns + seed data) | `supabase/migrations/` |
| **2** | Add "Testimonials" to sidebar + middleware | `sidebar.tsx`, `middleware.ts` |
| **3** | Build admin testimonials page | `app/admin/testimonials/page.tsx` |
| **4** | Build scrolling testimonials component | `components/scrolling-testimonials.tsx` |
| **5** | Update homepage to fetch from DB + use new component | `app/page.tsx` |
| **6** | Test & push to production | — |

---

## 7. UX Details

- **Scroll speed:** ~30s for full loop, smooth CSS animation
- **Pause on hover:** User can read without it moving
- **Responsive:** Cards shrink on mobile, fewer visible at once
- **Photo fallback:** Initials avatar if no photo uploaded
- **Toast notifications:** Confirm create, update, delete
