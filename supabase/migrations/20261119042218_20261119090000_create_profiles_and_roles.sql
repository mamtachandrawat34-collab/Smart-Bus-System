/*
# Create profiles table with student/admin roles

## Purpose
Adds authentication and role-based access to the Smart College Bus
Management System. Every signed-up user gets a profile row with role
'student'. Admins are promoted separately via a SECURITY DEFINER function
that only the service role can call — students can never self-promote.

## New Tables
1. `profiles`
   - `id` (uuid, primary key) — matches auth.users.id
   - `email` (text) — denormalised for display
   - `role` (text) — 'student' | 'admin', default 'student'
   - `display_name` (text) — optional friendly name
   - `created_at` (timestamptz) — when the profile was created
   - CHECK constraint enforces role ∈ ('student','admin')

## New Functions
1. `public.handle_new_user()` — SECURITY DEFINER trigger function that
   fires AFTER INSERT on auth.users. Reads the new user's email and id and
   inserts a matching profile row with role 'student'. This ensures every
   user has a profile the moment they sign up.
2. `public.promote_user_to_admin(target_email text)` — SECURITY DEFINER
   function that sets role = 'admin' on the profile matching the given
   email AND updates raw_app_meta_data so the JWT carries the role. This
   function REVOKEs EXECUTE from PUBLIC/anon and grants it ONLY to
   service_role (the backend), so no student can call it from the browser.

## Security
- RLS enabled on profiles.
- Grants: SELECT to authenticated (so users and admins can read profiles),
  UPDATE (display_name only) to authenticated.
- Policies:
  - SELECT: any authenticated user can read all profiles (students see
    driver/admin contact info; admins see the user list). This is
    intentional — profiles contain only display info, not secrets.
  - UPDATE: users can update only their own display_name. Role is NOT
    updatable through this grant (column-restricted).
- `handle_new_user` runs as SECURITY DEFINER (owner-level) so it can write
  to profiles even though the signing-up user has no session yet.
- `promote_user_to_admin` runs as SECURITY DEFINER and is only callable by
  service_role — the browser anon key cannot invoke it.
- Email confirmation stays OFF (default).

## Important notes
1. Students self-register with role 'student'. There is no way for a
   browser request to set role = 'admin'.
2. To create an admin: sign up a user normally, then call
   promote_user_to_admin from a privileged context (service role / SQL).
3. The role is mirrored into auth.users.raw_app_meta_data so JWT claims
   carry it for frontend authorization checks.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student',
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_role_chk CHECK (role IN ('student','admin'))
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all profiles (display info only).
GRANT SELECT ON public.profiles TO authenticated;

-- Users may update only their own display_name (role is not grantable).
GRANT UPDATE (display_name) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own_display_name" ON public.profiles;
CREATE POLICY "profiles_update_own_display_name" ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- Trigger: auto-create profile on signup ----

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, COALESCE(NEW.email, ''), '');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---- Admin promotion function (service-role only) ----

CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = target_email;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email: %', target_email;
  END IF;

  UPDATE public.profiles SET role = 'admin' WHERE id = target_id;

  -- Mirror role into JWT app_metadata so the frontend can read it.
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
  WHERE id = target_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.promote_user_to_admin(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(text) TO service_role;

-- Index for email lookups.
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
