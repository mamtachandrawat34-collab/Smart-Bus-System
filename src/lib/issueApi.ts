// Data-access layer for issue reports (maintenance + cleanliness),
// driver contacts, and photo uploads via Supabase.

import { supabase } from '@/lib/supabase';
import type { IssueReport, IssueReportType, IssueStatus, DriverContact } from '@/types';

const PHOTO_BUCKET = 'report-photos';
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// ---- Photo upload ----

export async function uploadReportPhoto(
  file: File
): Promise<{ path?: string; url?: string; error?: string }> {
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: 'Photo must be 5 MB or smaller.' };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { error: 'Photo must be a JPG, PNG, or WebP image.' };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (upErr) return { error: upErr.message };

  const { data: pubData } = supabase.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(path);
  return { path, url: pubData.publicUrl };
}

export function getPhotoPublicUrl(path: string): string {
  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ---- Issue reports (maintenance + cleanliness) ----

interface IssueRow {
  id: string;
  reporter_id: string;
  route_number: number;
  route_name: string;
  bus_identifier: string;
  category: string;
  description: string;
  photo_path: string | null;
  status: IssueStatus;
  submitted_at: string;
}

function rowToIssue(r: IssueRow, type: IssueReportType): IssueReport {
  return {
    id: r.id,
    type,
    reporterId: r.reporter_id,
    routeNumber: r.route_number,
    routeName: r.route_name,
    busIdentifier: r.bus_identifier,
    category: r.category,
    description: r.description,
    photoPath: r.photo_path,
    photoUrl: r.photo_path ? getPhotoPublicUrl(r.photo_path) : null,
    status: r.status,
    submittedAt: r.submitted_at,
  };
}

export async function fetchIssueReports(
  type: IssueReportType
): Promise<{ data: IssueReport[]; error?: string }> {
  const table = type === 'maintenance' ? 'maintenance_reports' : 'cleanliness_reports';
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data as IssueRow[]).map((r) => rowToIssue(r, type)) };
}

export async function insertIssueReport(
  type: IssueReportType,
  input: {
    routeNumber: number;
    routeName: string;
    busIdentifier: string;
    category: string;
    description: string;
    photoPath?: string | null;
  }
): Promise<{ error?: string }> {
  const table = type === 'maintenance' ? 'maintenance_reports' : 'cleanliness_reports';
  const { error } = await supabase.from(table).insert({
    route_number: input.routeNumber,
    route_name: input.routeName,
    bus_identifier: input.busIdentifier,
    category: input.category,
    description: input.description,
    photo_path: input.photoPath ?? null,
  });
  if (error) return { error: error.message };
  return {};
}

export async function updateIssueStatus(
  type: IssueReportType,
  id: string,
  status: IssueStatus
): Promise<{ error?: string }> {
  const table = type === 'maintenance' ? 'maintenance_reports' : 'cleanliness_reports';
  const { error } = await supabase.from(table).update({ status }).eq('id', id);
  if (error) return { error: error.message };
  return {};
}

// ---- Drivers ----

interface DriverRow {
  id: string;
  route_number: number;
  driver_name: string;
  driver_phone: string;
  updated_at: string;
}

function rowToDriver(r: DriverRow): DriverContact {
  return {
    id: r.id,
    routeNumber: r.route_number,
    driverName: r.driver_name,
    driverPhone: r.driver_phone,
    updatedAt: r.updated_at,
  };
}

export async function fetchDrivers(): Promise<{ data: DriverContact[]; error?: string }> {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('route_number', { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data as DriverRow[]).map(rowToDriver) };
}

export async function upsertDriver(input: {
  routeNumber: number;
  driverName: string;
  driverPhone: string;
}): Promise<{ error?: string }> {
  const { error } = await supabase.from('drivers').upsert(
    {
      route_number: input.routeNumber,
      driver_name: input.driverName,
      driver_phone: input.driverPhone,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'route_number' }
  );
  if (error) return { error: error.message };
  return {};
}

export async function deleteDriver(routeNumber: number): Promise<{ error?: string }> {
  const { error } = await supabase.from('drivers').delete().eq('route_number', routeNumber);
  if (error) return { error: error.message };
  return {};
}
