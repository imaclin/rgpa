# Messages / Contact Form Plan

## Goal
Make the contact form functional: save messages to Supabase, send email notifications to 3 recipients, and provide an admin "Messages" tab to view/manage submissions.

---

## Current State
- Contact form exists at `/contact` but **does not work** — it fakes a submission with `setTimeout`
- No API routes exist (`/src/app/api/` doesn't exist)
- No messages table in Supabase

---

## 1. Database Migration (`supabase/migrations/010_messages.sql`)

### `messages` table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| name | TEXT NOT NULL | Sender name |
| email | TEXT NOT NULL | Sender email |
| phone | TEXT | Optional phone |
| subject | TEXT NOT NULL | Message subject |
| message | TEXT NOT NULL | Message body |
| status | TEXT DEFAULT 'unread' | `unread`, `read`, `archived` |
| created_at | TIMESTAMPTZ | Auto |

### RLS
- No public SELECT (messages are private)
- Public INSERT (anyone can submit the form)
- Authenticated users can SELECT, UPDATE, DELETE (admin access)

---

## 2. API Route (`/src/app/api/contact/route.ts`)

POST endpoint that:
1. Validates required fields (name, email, subject, message)
2. Inserts message into `messages` table via Supabase service role client
3. Sends email notification to:
   - `kcstitak@gmail.com`
   - `kl335704@gmail.com`
   - `info@revifi.com`
4. Returns success/error response

### Email Sending Options
- **Resend** (recommended) — simple API, free tier supports 100 emails/day
- Alternative: Supabase Edge Function with SMTP

Email contains: sender name, email, phone, subject, and full message body.

---

## 3. Update Contact Page (`/src/app/contact/page.tsx`)

- Replace fake `setTimeout` with actual `fetch('/api/contact', ...)` POST request
- Handle success/error responses
- Show appropriate toast messages

---

## 4. Admin Sidebar & Middleware

- Add "Messages" nav item to admin sidebar (use `MessageSquare` or `Inbox` icon)
- Add `/messages` to `adminRoutes` in middleware

---

## 5. Admin Messages Page (`/admin/messages`)

### Messages List View
- Table/list of all messages, newest first
- Columns: status indicator (dot), name, subject, date, email
- Unread messages shown in bold
- Click to expand/view full message
- Filter by status: All, Unread, Read, Archived
- Unread count badge on sidebar nav item

### Message Detail (expandable or slide-out)
- Full message content
- Sender info (name, email, phone)
- Timestamp
- Actions: Mark as Read, Mark as Unread, Archive, Delete

---

## 6. Files Changed/Created

| File | Action |
|------|--------|
| `supabase/migrations/010_messages.sql` | New — migration |
| `src/app/api/contact/route.ts` | New — POST endpoint |
| `src/app/contact/page.tsx` | Edit — wire up real submission |
| `src/components/admin/sidebar.tsx` | Edit — add Messages nav item |
| `src/middleware.ts` | Edit — add `/messages` to adminRoutes |
| `src/app/admin/messages/page.tsx` | New — admin messages page |

---

## 7. Rate Limiting

### Server-side (API route)
- **IP-based rate limit**: Max 3 submissions per IP per 5-minute window
- Use an in-memory Map with IP → timestamp[] tracking (resets on deploy, sufficient for Vercel serverless)
- Return 429 Too Many Requests if exceeded

### Client-side
- Disable submit button for 5 seconds after successful submission
- Honeypot field (hidden input) — if filled, silently reject (bot trap)

---

## 8. Environment Variables Needed
- `RESEND_API_KEY` — for sending email notifications (add to Vercel env vars and `.env.local`)
- **Never hardcode API keys in source code**

---

## 9. Test & Push
- Run migration in Supabase SQL editor
- Test form submission → verify DB insert + email delivery
- Test admin messages page
- Commit & push
