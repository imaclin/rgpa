# Project Files Upload — Implementation Plan

## Overview
Add a "Files" tab alongside the existing "Media" section on the project detail page (`/admin/projects/[id]`). This allows uploading, viewing, and downloading documents (PDFs, TXT, PPTX, DOCX, XLSX, etc.) associated with a property.

---

## 1. Database Schema

### `project_files` table
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `project_id` | UUID (FK → projects) | Required, ON DELETE CASCADE |
| `name` | TEXT | Original file name |
| `storage_path` | TEXT | Path in Supabase Storage |
| `url` | TEXT | Public URL for download |
| `file_type` | TEXT | MIME type (e.g. `application/pdf`) |
| `file_size` | INTEGER | Size in bytes |
| `uploaded_by` | TEXT | Optional, user email or name |
| `created_at` | TIMESTAMPTZ | Default NOW() |

**RLS Policies:**
- Public: no access
- Authenticated: full CRUD

**Migration file:** `supabase/migrations/006_project_files.sql`

**Storage:** Uses the existing `media` bucket with a `files/` prefix path (e.g. `files/{project_id}/{filename}`)

---

## 2. File Structure

```
src/components/admin/
├── project-media.tsx          # Existing — wrap in tabs
└── project-files.tsx          # NEW — file upload, list, download, delete
```

---

## 3. Changes to `project-media.tsx`

**Current:** A single `<Card>` titled "Project Media" with upload + image grid.

**New:** Wrap the existing content in a `<Tabs>` component with two tabs:
- **Media** — Existing image/video upload and grid (unchanged)
- **Files** — New `<ProjectFiles>` component

The outer `<Card>` and `<CardTitle>` ("Project Media") become the tab container. The card title changes to just "Project Assets" or similar, with tabs inside.

---

## 4. `ProjectFiles` Component

### Features
- **Upload area** — Drag-and-drop or click to browse, accepts all common document types
- **File list** — Table/list view showing:
  - File type icon (PDF, Word, Excel, PowerPoint, text, generic)
  - File name
  - File size (human-readable: KB, MB)
  - Upload date
  - Download button
  - Delete button (with confirmation)
- **Accepted types:** `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.txt`, `.csv`, `.zip`, `.rar`
- **Max size:** 50MB per file
- **Empty state:** Friendly message when no files uploaded

### File Type Icons
Map MIME types to icons:
- `application/pdf` → FileText (red)
- `application/vnd.ms-powerpoint` / `pptx` → Presentation (orange)
- `application/vnd.ms-excel` / `xlsx` → Sheet (green)
- `application/msword` / `docx` → FileText (blue)
- `text/plain`, `text/csv` → FileText (gray)
- Default → File (gray)

---

## 5. Supabase Migration

```sql
CREATE TABLE IF NOT EXISTS project_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);

ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage project files" ON project_files
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## 6. Implementation Order

| Step | Description | Files |
|---|---|---|
| **1** | Create migration `006_project_files.sql` | `supabase/migrations/` |
| **2** | Build `ProjectFiles` component | `components/admin/project-files.tsx` |
| **3** | Add tabs to `project-media.tsx` wrapping Media + Files | `components/admin/project-media.tsx` |
| **4** | Test build & push to production | — |

---

## 7. UX Details

- **Download:** Direct link opens file in new tab or triggers browser download
- **Upload feedback:** Progress indication, success/error toasts
- **File size display:** Auto-format (bytes → KB → MB)
- **Sort:** Most recent uploads first
- **Delete:** Confirmation dialog, removes from both storage and database
- **Responsive:** File list stacks cleanly on mobile
