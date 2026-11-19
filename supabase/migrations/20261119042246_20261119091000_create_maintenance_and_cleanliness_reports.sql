/*
# Create maintenance_reports and cleanliness_reports tables

## Purpose
Students can report technical problems (breakdowns, damaged seats, faulty
doors/windows, water leakage, other) and cleanliness problems (dirty seats,
unclean floors, litter, bad smell, other). Each report captures bus/route,
category, description, submission time, optional photo path, and a status.

## New Tables
1. `maintenance_reports`
   - id (uuid PK), reporter_id (FK auth.users, default auth.uid()),
     route_number, route_name, bus_identifier, category, description,
     photo_path (nullable), status, submitted_at.
   - Categories: breakdown | damaged_seats | faulty_doors_windows |
     water_leakage | other
   - Statuses: Submitted | In Progress | Resolved

2. `cleanliness_reports`
   - Same shape with categories: dirty_seats | unclean_floors | litter |
     bad_smell | other

## Security
- RLS enabled on both.
- reporter_id defaults to auth.uid() so client inserts succeed.
- Grants: SELECT, INSERT to authenticated; UPDATE (status) only to
  authenticated (admins change status; students cannot edit content).
- Policies: SELECT all authenticated; INSERT only self; UPDATE all
  authenticated (column grant limits to status column only).
- No anon access — sign-in required.
*/

-- ===================== maintenance_reports =====================

CREATE TABLE IF NOT EXISTS public.maintenance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  route_number integer NOT NULL,
  route_name text NOT NULL,
  bus_identifier text NOT NULL DEFAULT '',
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  photo_path text,
  status text NOT NULL DEFAULT 'Submitted',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT maintenance_category_chk
    CHECK (category IN ('breakdown','damaged_seats','faulty_doors_windows','water_leakage','other')),
  CONSTRAINT maintenance_status_chk
    CHECK (status IN ('Submitted','In Progress','Resolved')),
  CONSTRAINT maintenance_route_chk
    CHECK (route_number BETWEEN 1 AND 20)
);

ALTER TABLE public.maintenance_reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.maintenance_reports TO authenticated;
GRANT UPDATE (status) ON public.maintenance_reports TO authenticated;

DROP POLICY IF EXISTS "select_maintenance_reports" ON public.maintenance_reports;
CREATE POLICY "select_maintenance_reports" ON public.maintenance_reports FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_maintenance_reports" ON public.maintenance_reports;
CREATE POLICY "insert_maintenance_reports" ON public.maintenance_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "update_maintenance_reports" ON public.maintenance_reports;
CREATE POLICY "update_maintenance_reports" ON public.maintenance_reports FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS maintenance_reports_submitted_at_idx
  ON public.maintenance_reports (submitted_at DESC);
CREATE INDEX IF NOT EXISTS maintenance_reports_route_idx
  ON public.maintenance_reports (route_number);
CREATE INDEX IF NOT EXISTS maintenance_reports_status_idx
  ON public.maintenance_reports (status);

-- ===================== cleanliness_reports =====================

CREATE TABLE IF NOT EXISTS public.cleanliness_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  route_number integer NOT NULL,
  route_name text NOT NULL,
  bus_identifier text NOT NULL DEFAULT '',
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  photo_path text,
  status text NOT NULL DEFAULT 'Submitted',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cleanliness_category_chk
    CHECK (category IN ('dirty_seats','unclean_floors','litter','bad_smell','other')),
  CONSTRAINT cleanliness_status_chk
    CHECK (status IN ('Submitted','In Progress','Resolved')),
  CONSTRAINT cleanliness_route_chk
    CHECK (route_number BETWEEN 1 AND 20)
);

ALTER TABLE public.cleanliness_reports ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.cleanliness_reports TO authenticated;
GRANT UPDATE (status) ON public.cleanliness_reports TO authenticated;

DROP POLICY IF EXISTS "select_cleanliness_reports" ON public.cleanliness_reports;
CREATE POLICY "select_cleanliness_reports" ON public.cleanliness_reports FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_cleanliness_reports" ON public.cleanliness_reports;
CREATE POLICY "insert_cleanliness_reports" ON public.cleanliness_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "update_cleanliness_reports" ON public.cleanliness_reports;
CREATE POLICY "update_cleanliness_reports" ON public.cleanliness_reports FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS cleanliness_reports_submitted_at_idx
  ON public.cleanliness_reports (submitted_at DESC);
CREATE INDEX IF NOT EXISTS cleanliness_reports_route_idx
  ON public.cleanliness_reports (route_number);
CREATE INDEX IF NOT EXISTS cleanliness_reports_status_idx
  ON public.cleanliness_reports (status);
