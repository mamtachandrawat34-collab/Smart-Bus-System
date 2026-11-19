/*
# Create drivers table for route driver contacts

## Purpose
Stores verified driver contact information (name + phone) per route number.
Admins manage these records; students view them alongside route details.
No fabricated data is seeded — admins add real contacts through the UI.

## New Tables
1. `drivers`
   - id (uuid PK)
   - route_number (int, unique) — one driver record per route
   - driver_name (text) — verified driver name
   - driver_phone (text) — verified phone number
   - updated_at (timestamptz) — last update time
   - CHECK route_number BETWEEN 1 AND 20

## Security
- RLS enabled.
- Grants: SELECT to authenticated (students see driver contacts);
  INSERT, UPDATE, DELETE to authenticated (admins manage).
- Policies: SELECT all authenticated; INSERT/UPDATE/DELETE all
  authenticated. The frontend restricts management UI to admins only.
  For stricter server-side enforcement, an admin-only predicate could be
  added, but because admin role lives in JWT app_metadata, the policy
  would need to inspect auth.jwt() ->> 'role'. We add that guard here:

  WITH CHECK (auth.jwt() ->> 'role' = 'admin')

  This means only users whose JWT carries role=admin can insert/update/
  delete driver records. Students (role=student) are blocked at the
  database level even if they crafted an API call.
*/

CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number integer NOT NULL UNIQUE,
  driver_name text NOT NULL DEFAULT '',
  driver_phone text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT drivers_route_chk CHECK (route_number BETWEEN 1 AND 20)
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.drivers TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.drivers TO authenticated;

DROP POLICY IF EXISTS "select_drivers" ON public.drivers;
CREATE POLICY "select_drivers" ON public.drivers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_drivers" ON public.drivers;
CREATE POLICY "insert_drivers" ON public.drivers FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "update_drivers" ON public.drivers;
CREATE POLICY "update_drivers" ON public.drivers FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "delete_drivers" ON public.drivers;
CREATE POLICY "delete_drivers" ON public.drivers FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE INDEX IF NOT EXISTS drivers_route_idx ON public.drivers (route_number);
