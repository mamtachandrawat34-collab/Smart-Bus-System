/*
# Tighten notifications RLS to authenticated-only

## Purpose
The app now requires sign-in. The notifications table previously allowed
anon CRUD. We switch it to authenticated-only to match the new auth model.

## Security
- Revoke all privileges from anon.
- Grant SELECT, INSERT, UPDATE, DELETE to authenticated.
- Replace policies: SELECT all authenticated; INSERT/UPDATE/DELETE all
  authenticated (notifications are shared and system-generated).
*/

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.notifications FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

DROP POLICY IF EXISTS "anon_select_notifications" ON public.notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON public.notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON public.notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON public.notifications;

DROP POLICY IF EXISTS "select_notifications" ON public.notifications;
CREATE POLICY "select_notifications" ON public.notifications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_notifications" ON public.notifications;
CREATE POLICY "insert_notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_notifications" ON public.notifications;
CREATE POLICY "update_notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_notifications" ON public.notifications;
CREATE POLICY "delete_notifications" ON public.notifications FOR DELETE
  TO authenticated USING (true);
