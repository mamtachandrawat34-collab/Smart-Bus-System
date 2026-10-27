/*
# Create crowd_reports and notifications tables

## Purpose
Powers the Smart College Bus Management System prototype. Crowd reports and
notifications are stored in the database so they are shared across all
students' devices (replacing the earlier browser-only localStorage approach).
Route/stop reference data stays in the frontend (parsed from the provided
CSV) to preserve original values and verification flags exactly.

## New Tables
1. `crowd_reports`
   - `id` (text, primary key) — human-readable report id generated client-side (RPT-...)
   - `route_number` (int) — route the report refers to
   - `route_name` (text) — denormalised for display
   - `stop_name` (text) — stop the student selected
   - `travel_period` (text) — Morning | Afternoon | Evening
   - `crowd_level` (text) — Low | Medium | High
   - `description` (text) — optional student note
   - `submitted_at` (timestamptz) — submission timestamp
   - `status` (text) — prototype status: New | Under Review | Acknowledged
   - CHECK constraints enforce the allowed enum values and route range.

2. `notifications`
   - `id` (text, primary key)
   - `title` (text)
   - `description` (text)
   - `category` (text) — high_crowd | report_activity | informational
   - `created_at` (timestamptz)
   - `read` (boolean, default false) — persisted read/unread state
   - `related_report_id` (text, nullable) — link to crowd_reports.id (no FK: a
     report may be deleted while we keep its historical notification)
   - CHECK constraint enforces the allowed category values.

## Security
- This is a single-tenant, no-sign-in prototype: the frontend uses the anon
  key for its whole lifetime, so policies are scoped to `anon, authenticated`
  and the data is intentionally shared/public across all devices.
- RLS enabled on both tables.
- Grants: full CRUD on both tables to anon + authenticated (the app reads,
  creates, updates status/read-state, and deletes).
- `USING (true)` / `WITH CHECK (true)` is correct here because the data is
  intentionally public/shared — this is documented, not a shortcut around
  an ownership check.
- No `user_id` columns and no reference to `auth.users` — there is no sign-in
  screen in this prototype.
- No service_role grant: no edge functions touch these tables.

## Important notes
1. Route/stop reference data is NOT stored here — it lives in the frontend
   `src/data/routes.ts` to keep the parsed CSV values (including the
   verification flag on Route 3 / HARI FATHAK) exactly as provided.
2. Report statuses are prototype labels only and do NOT imply staff review.
3. Notifications are generated only from real application events
   (report submitted / high-crowd report) plus two informational welcome
   notices seeded by the frontend on first load.
*/

CREATE TABLE IF NOT EXISTS crowd_reports (
  id text PRIMARY KEY,
  route_number integer NOT NULL,
  route_name text NOT NULL,
  stop_name text NOT NULL,
  travel_period text NOT NULL,
  crowd_level text NOT NULL,
  description text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'New',
  CONSTRAINT crowd_reports_travel_period_chk
    CHECK (travel_period IN ('Morning','Afternoon','Evening')),
  CONSTRAINT crowd_reports_crowd_level_chk
    CHECK (crowd_level IN ('Low','Medium','High')),
  CONSTRAINT crowd_reports_status_chk
    CHECK (status IN ('New','Under Review','Acknowledged')),
  CONSTRAINT crowd_reports_route_chk
    CHECK (route_number BETWEEN 1 AND 20)
);

ALTER TABLE crowd_reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON crowd_reports TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_crowd_reports" ON crowd_reports;
CREATE POLICY "anon_select_crowd_reports" ON crowd_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_crowd_reports" ON crowd_reports;
CREATE POLICY "anon_insert_crowd_reports" ON crowd_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_crowd_reports" ON crowd_reports;
CREATE POLICY "anon_update_crowd_reports" ON crowd_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_crowd_reports" ON crowd_reports;
CREATE POLICY "anon_delete_crowd_reports" ON crowd_reports FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS crowd_reports_submitted_at_idx
  ON crowd_reports (submitted_at DESC);
CREATE INDEX IF NOT EXISTS crowd_reports_route_idx
  ON crowd_reports (route_number);
CREATE INDEX IF NOT EXISTS crowd_reports_crowd_level_idx
  ON crowd_reports (crowd_level);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false,
  related_report_id text,
  CONSTRAINT notifications_category_chk
    CHECK (category IN ('high_crowd','report_activity','informational'))
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS notifications_created_at_idx
  ON notifications (created_at DESC);
