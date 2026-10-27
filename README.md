# Smart College Bus Management System

A college project prototype that helps students find college bus routes and
report overcrowding they experience on their daily commute. Crowd reports and
notifications persist in a shared Supabase database, so they are visible across
all students' devices.

## Project overview

A clean, modern transport-management dashboard where students can:

- Browse college bus routes, stops and available timings.
- Search routes by route number or stop name and filter them.
- Submit crowd reports (Low / Medium / High) for a specific route and stop.
- View, search, filter, sort and delete submitted crowd reports.
- Receive in-app notifications generated from real application events
  (e.g. a high-crowd report is submitted).

## Problem statement

College students often lack a single, easy place to check bus routes, stops
and timings, and there is no simple way to share overcrowding observations so
others can plan ahead. This project addresses that gap with a focused,
easy-to-use dashboard.

## Features

- **Dashboard** with live summary cards (Total Routes, Total Stops, Total
  Crowd Reports, High-Crowd Reports) calculated from the route dataset and
  the database.
- **Bus Routes** page with route & stop search, route filter, expandable
  route cards showing stops and timings, and verification badges.
- **Crowd Report form** with route-dependent stop selection, required-field
  validation, unique report IDs, and a confirmation toast. Submission is
  async with a loading state and error feedback.
- **Crowd Reports** page with search, route/crowd filters, newest-first
  sort, detail view, individual delete and clear-all (both with
  confirmation), and a readable table (desktop) / cards (mobile).
- **Notifications** page with All / Unread / category tabs, mark-as-read and
  mark-all-as-read. Notifications and read states persist in the database.
- **About Project** page covering problem, objective, target users,
  features, technologies, limitations and future scope.
- Responsive layout (desktop, tablet, mobile) with a deep-navy sidebar and
  a working collapsible menu on mobile.

## Technologies

- React with TypeScript
- Vite (build tool / dev server)
- Tailwind CSS (styling)
- Lucide React (icons)
- Supabase (Postgres database, row-level security) — shared persistence for
  crowd reports and notifications

## Backend and database

Crowd reports and notifications are stored in a Supabase Postgres database
so they sync across all students' devices. The two tables are:

- `crowd_reports` — one row per submitted report, with CHECK constraints
  enforcing valid `travel_period`, `crowd_level`, `status`, and route range.
- `notifications` — one row per in-app notification, with a `read` flag and
  an optional link back to the report that generated it.

Route and stop reference data is **not** stored in the database. It lives in
the frontend file `src/data/routes.ts`, parsed from the provided CSV, so the
original stop names, ordering and verification flags are preserved exactly.

### Security

- Row-level security (RLS) is enabled on both tables.
- The frontend uses the Supabase **anon key** only — no service-role key or
  database password is exposed in client code.
- Policies are scoped to `anon, authenticated` because this is a no-sign-in
  prototype: the data is intentionally shared across all students.
- Server-side CHECK constraints validate `crowd_level`, `travel_period`,
  `status`, and route number on every insert/update.
- No authentication screen is required for this prototype. If sign-in is
  added later, policies should be re-scoped to `authenticated` with
  `auth.uid()` ownership checks, and a `user_id` column added.

## Setup and run

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build
npm run typecheck # TypeScript type checking
```

The dev server runs automatically in this Bolt environment — no manual
start required. Supabase connection details (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`) are pre-populated in `.env`.

## Testing instructions

You can verify the main user journey in the browser:

1. Open the Dashboard — summary cards show counts from the route dataset
   and any reports in the database (zero when none exist).
2. Click each sidebar item to confirm navigation works.
3. On Bus Routes, search by route number (e.g. "3") and by stop name
   (e.g. "NANAKHEDA"); use the filter dropdown and Reset.
4. Expand a route to view its stops and timings.
5. Click "Report Bus Crowd", choose a route, confirm the stop list updates
   and the previous stop resets when the route changes.
6. Try submitting with empty required fields — validation errors appear.
7. Submit a valid High-crowd report — a success toast appears and the
   report shows on the Dashboard and Crowd Reports page.
8. Open the app in a second browser/device — the submitted report is
   visible there too (shared database, not per-browser).
9. On Crowd Reports, use search, route filter and crowd filter; open a
   report detail and change its status; delete one report and confirm.
10. On Notifications, confirm a high-crowd notification exists, mark it
    read, and use Mark all as read. Refresh — read state persists.
11. Use "Clear All" on Crowd Reports — confirm dashboard stats update.
12. Search for a non-existent term — the empty state appears.
13. Resize to a narrow width — the sidebar collapses into a mobile menu.

### Verified checks

- `npm run typecheck` — passes with no errors.
- `npm run build` — production build succeeds.
- Database migration applied successfully; `crowd_reports` and
  `notifications` tables created with RLS enabled.
- Supabase security advisor: 0 findings.
- Server-side validation confirmed: inserting a row with an invalid
  `crowd_level` ("Packed") is rejected by the `crowd_reports_crowd_level_chk`
  CHECK constraint.
- Insert/delete round-trip verified via SQL.

## Current limitations

- Report statuses ("New", "Under Review", "Acknowledged") are prototype
  labels and do not imply that college staff have reviewed a report.
- No sign-in screen — reports and notifications are shared publicly across
  all students using the app. There is no per-user attribution.
- No live GPS tracking or official transport announcements.
- Route data is loaded from a static dataset parsed from the provided CSV.
- Some stop timings need verification — see `DATA_NOTES.md`.
- UI-level feature tests (clicking through the flows above) were not run in
  this environment, which has no browser. The build and typecheck pass, and
  database read/write/validate were verified directly.

## Future scope

- Secure student/staff sign-in with per-user attribution and role-based
  access (students submit; coordinators review and update status).
- Verified GPS integration for live bus tracking.
- Official transport announcements and delay notifications.

These are future features and are not implemented in this prototype.

## Data source

Route, stop and timing data is parsed from
`src/data/Smart_Bus_Route_Data.csv` into the structured file
`src/data/routes.ts`. Original values are preserved exactly, including
entries flagged as needing verification. Driver phone numbers and private
information are intentionally excluded.
