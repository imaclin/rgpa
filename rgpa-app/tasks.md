# Property Task Manager — Implementation Plan

## Overview
A new admin page at `/admin/tasks` that serves as a property-level task management tool. The entry point shows a list of all properties (projects). Clicking a property opens its dedicated task list with full CRUD, reordering, completion tracking, and progress visibility.

---

## 1. Database Schema

### `tasks` table
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `project_id` | UUID (FK → projects) | Required, ON DELETE CASCADE |
| `title` | TEXT | Required |
| `description` | TEXT | Optional notes/details |
| `status` | TEXT | `pending`, `in_progress`, `completed` |
| `priority` | TEXT | `low`, `medium`, `high`, `urgent` |
| `due_date` | DATE | Optional deadline |
| `completed_at` | TIMESTAMPTZ | Set when marked complete |
| `sort_order` | INTEGER | For drag-to-reorder |
| `created_at` | TIMESTAMPTZ | Default NOW() |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

**RLS Policies:**
- Public: no access
- Authenticated: full CRUD

**Migration file:** `supabase/migrations/005_tasks.sql`

---

## 2. File Structure

```
src/app/admin/tasks/
├── page.tsx                  # Property list view (entry point)
└── [id]/
    └── page.tsx              # Task list for a specific property

src/components/admin/
├── task-item.tsx             # Single task row (checkbox, title, priority badge, due date, actions)
└── task-form.tsx             # Inline form / dialog for creating & editing tasks
```

---

## 3. Page 1: Property List (`/admin/tasks`)

**Purpose:** Show all properties with task progress at a glance.

**Features:**
- Grid/list of all projects from the `projects` table
- Each card shows:
  - Property name & location
  - Featured image thumbnail
  - Task progress bar (e.g. "8/12 tasks complete")
  - Count of overdue tasks (red badge)
- Search/filter by property name
- Click a property → navigates to `/admin/tasks/[project_id]`

---

## 4. Page 2: Property Task List (`/admin/tasks/[id]`)

**Purpose:** Full task management for a single property.

### 4a. Header
- Back button to `/admin/tasks`
- Property name + location
- Overall progress bar + completion percentage

### 4b. Task Creation
- Inline "Add task" input at the top (quick-add: just title, press Enter)
- Expand for full form: title, description, priority, due date

### 4c. Task List
- Grouped by status: **In Progress** → **Pending** → **Completed** (collapsed by default)
- Each task row shows:
  - Drag handle (grip icon) for reordering
  - Checkbox to toggle complete/incomplete
  - Title (strikethrough when complete)
  - Priority badge (color-coded: urgent=red, high=orange, medium=blue, low=gray)
  - Due date (red text if overdue)
  - Edit button → opens edit dialog
  - Delete button → confirmation dialog
- Drag-and-drop reordering within status groups
- Completing a task: checkbox animates, task moves to "Completed" group, `completed_at` timestamp saved

### 4d. Task Edit Dialog
- Title, description, priority dropdown, due date picker, status dropdown
- Save / Cancel buttons

### 4e. Bulk Actions
- "Clear completed" button to delete all completed tasks at once

---

## 5. Sidebar Update

Add to the navigation array in `src/components/admin/sidebar.tsx`:
```ts
{ name: "Tasks", href: "/admin/tasks", icon: ClipboardList }
```
Position it after "Projects" since tasks are project-related.

Also update the middleware `adminRoutes` array to include `/tasks`.

---

## 6. Implementation Order

| Step | Description | Files |
|---|---|---|
| **1** | Create migration `005_tasks.sql` | `supabase/migrations/` |
| **2** | Add "Tasks" to sidebar + middleware | `sidebar.tsx`, `middleware.ts` |
| **3** | Build property list page | `app/admin/tasks/page.tsx` |
| **4** | Build task-item component | `components/admin/task-item.tsx` |
| **5** | Build task-form component | `components/admin/task-form.tsx` |
| **6** | Build property task list page | `app/admin/tasks/[id]/page.tsx` |
| **7** | Test & push to production | — |

---

## 7. UX Details

- **Optimistic UI:** Checkbox toggles and reorders update instantly, sync to DB in background
- **Toast notifications:** Confirm create, update, delete, reorder actions
- **Empty states:** Friendly message + CTA when a property has no tasks
- **Responsive:** Works on mobile with swipe-friendly task rows
- **Keyboard:** Enter to quick-add, Escape to cancel edit
- **Progress persistence:** Completed tasks stay visible (collapsed) so you can track history
