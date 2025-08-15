# Home Dashboard v2 (Frontend)

This document describes the refactored Home Dashboard and its integration with Xano APIs.

## Dev Route
- Open: `http://localhost:5173/?home=v2`
- This route does not affect production and is safe for iteration.

## Endpoints Used (Xano)
- Base URLs
  - Auth: `https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u`
  - Home: `https://x8gd-ip42-19oh.n7e.xano.io/api:vUhMdCxR`
- Tasks
  - GET `/tasks/{userid}` with `assignee_id` query
  - GET `/task/count/{userid}`
  - POST `/task`
  - PATCH `/task/{id}`
  - DELETE `/task/{task_id}`
  - PATCH `/tasks/reorder` (conditional; hide if not supported)
- Home Profile (if available)
  - GET `/home_profile/{home_profile_id}`

## Files
- `src/pages/HomeDashboardPage.tsx` — Page component
- `src/src/hooks/useTasksSummary.ts` — Fetches tasks and counts, derives lists
- `src/src/utils/taskAdapter.ts` — snake_case ↔ camelCase mapping helpers
- `src/src/services/taskService.ts` — Task CRUD
- `src/src/services/homeProfileService.ts` — Home profile read via home API client

## Features
- Summary tiles (To Do / Scheduled / Booked) with counts
- Upcoming and Overdue lists (based on `due_date`)
- Quick Add Task (POST /task) with optimistic UI and count refresh
- Delete task (DELETE /task/{task_id}) with optimistic UI + rollback on error
- Inline Edit (due date / priority / provider) with PATCH /task/{id}
- Optional: Home Profile at-a-glance (address + overall health) if endpoint/ID is present

## Testing
- Open the dev route and verify:
  - Counts match GET `/task/count/{userid}`
  - Creating a task adds to Upcoming; counts update
  - Editing a task persists and updates UI optimistically; rollback works on error
  - Deleting a task removes it and updates counts
  - Overdue list shows tasks with past `due_date` clearly labeled

## Notes
- The page relies on `useAuth()` to infer `user.id`; if absent, demos with `userId=2`.
- Provider values are limited to: `Plumbing`, `HVAC`, `Painting`, `Electrical`.
- When `/tasks/reorder` isn’t available on backend, the feature remains hidden; Kanban maintains reordering behavior per its own integration.


## Functional Checklist (Quick)
- Load http://localhost:5173/?home=v2 — counts and lists render
- Load http://localhost:5173/?home=v2&style=mock — mock-styled layout renders
- Quick Add creates a task and it appears in Upcoming; counts increase
- Edit a task’s due date/priority/provider and verify persistence on reload
- Delete a task and verify removal + counts decrease
- Provider dropdown shows types (fallback static if API empties)
- Home profile shows ring + address or a graceful fallback if endpoint 404s

---
Co-authored by Augment Code: https://www.augmentcode.com/?utm_source=repo&utm_medium=docs&utm_campaign=home_dashboard_v2

