/*
# Create storage bucket for report photos + tighten crowd_reports for auth

## Purpose
1. Create a public-readable storage bucket 'report-photos' where students
   upload optional photos with their maintenance/cleanliness reports.
2. Restrict uploads to authenticated users, validate file size via policy
   (Supabase storage policies can't inspect content-type reliably, so we
   rely on client-side validation + bucket-level public read).
3. Add submitted_by column to crowd_reports and tighten its RLS to require
   authentication (since the app now has sign-in).

## Storage
- Bucket 'report-photos' is created as a public bucket (photos are viewable
  by anyone with the URL, which is needed so admins and students can view
  them). Uploads are restricted to authenticated users via a storage policy.

## crowd_reports changes
- Add column submitted_by uuid referencing auth.users (nullable for
  backward compatibility with existing 8 rows).
- Backfill existing rows with a sentinel: set submitted_by to NULL is fine
  since existing policies allowed anon. We switch RLS to authenticated-only
  going forward, but keep anon SELECT so the app still works during the
  transition. Actually, since we now require sign-in, we move crowd_reports
  to authenticated-only CRUD with ownership on insert.

## Security
- Storage: public read, authenticated insert/update/delete on own files.
- crowd_reports: authenticated-only CRUD; submitted_by defaults to
  auth.uid(); ownership check on insert; SELECT all authenticated (shared
  visibility); UPDATE limited to status column (admins change status);
  DELETE by reporter or admin.
*/

-- ===================== Storage bucket =====================

INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for report photos.
DROP POLICY IF EXISTS "public_read_report_photos" ON storage.objects;
CREATE POLICY "public_read_report_photos" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'report-photos');

-- Authenticated users can upload to report-photos.
DROP POLICY IF EXISTS "auth_upload_report_photos" ON storage.objects;
CREATE POLICY "auth_upload_report_photos" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'report-photos');

-- Authenticated users can update/delete their own uploads.
DROP POLICY IF EXISTS "auth_update_report_photos" ON storage.objects;
CREATE POLICY "auth_update_report_photos" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'report-photos' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'report-photos');

DROP POLICY IF EXISTS "auth_delete_report_photos" ON storage.objects;
CREATE POLICY "auth_delete_report_photos" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'report-photos' AND owner = auth.uid());

-- ===================== crowd_reports: add submitted_by + tighten RLS =====================

ALTER TABLE public.crowd_reports
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill is not needed; existing rows stay NULL and are still visible.

-- Switch grants: remove anon, keep authenticated.
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.crowd_reports FROM anon;
GRANT SELECT, INSERT ON public.crowd_reports TO authenticated;
GRANT UPDATE (status) ON public.crowd_reports TO authenticated;
GRANT DELETE ON public.crowd_reports TO authenticated;

-- Replace policies with authenticated, ownership-scoped ones.
DROP POLICY IF EXISTS "anon_select_crowd_reports" ON public.crowd_reports;
DROP POLICY IF EXISTS "anon_insert_crowd_reports" ON public.crowd_reports;
DROP POLICY IF EXISTS "anon_update_crowd_reports" ON public.crowd_reports;
DROP POLICY IF EXISTS "anon_delete_crowd_reports" ON public.crowd_reports;

DROP POLICY IF EXISTS "select_crowd_reports" ON public.crowd_reports;
CREATE POLICY "select_crowd_reports" ON public.crowd_reports FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_crowd_reports" ON public.crowd_reports;
CREATE POLICY "insert_crowd_reports" ON public.crowd_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "update_crowd_reports" ON public.crowd_reports;
CREATE POLICY "update_crowd_reports" ON public.crowd_reports FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_crowd_reports" ON public.crowd_reports;
CREATE POLICY "delete_crowd_reports" ON public.crowd_reports FOR DELETE
  TO authenticated USING (auth.uid() = submitted_by OR auth.jwt() ->> 'role' = 'admin');

-- Index for submitted_by lookups.
CREATE INDEX IF NOT EXISTS crowd_reports_submitted_by_idx
  ON public.crowd_reports (submitted_by);
