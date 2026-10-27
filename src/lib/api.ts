// Data-access layer for crowd reports and notifications via Supabase.
// All errors from these helpers are returned as `{ error }` rather than
// thrown, so the UI can show a visible error state instead of crashing.

import { supabase } from '@/lib/supabase';
import type {
  AppNotification,
  CrowdLevel,
  CrowdReport,
  NotificationCategory,
  ReportStatus,
  TravelPeriod,
} from '@/types';

// ---- Row shapes (snake_case from Postgres) ----

interface ReportRow {
  id: string;
  route_number: number;
  route_name: string;
  stop_name: string;
  travel_period: TravelPeriod;
  crowd_level: CrowdLevel;
  description: string;
  submitted_at: string;
  status: ReportStatus;
}

interface NotificationRow {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  created_at: string;
  read: boolean;
  related_report_id: string | null;
}

function rowToReport(r: ReportRow): CrowdReport {
  return {
    id: r.id,
    routeNumber: r.route_number,
    routeName: r.route_name,
    stopName: r.stop_name,
    travelPeriod: r.travel_period,
    crowdLevel: r.crowd_level,
    description: r.description ?? '',
    submittedAt: r.submitted_at,
    status: r.status,
  };
}

function rowToNotification(n: NotificationRow): AppNotification {
  return {
    id: n.id,
    title: n.title,
    description: n.description,
    category: n.category,
    createdAt: n.created_at,
    read: n.read,
    relatedReportId: n.related_report_id ?? undefined,
  };
}

// ---- Crowd reports ----

export async function fetchReports(): Promise<{ data: CrowdReport[]; error?: string }> {
  const { data, error } = await supabase
    .from('crowd_reports')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data as ReportRow[]).map(rowToReport) };
}

export async function insertReport(
  report: CrowdReport
): Promise<{ error?: string }> {
  const row = {
    id: report.id,
    route_number: report.routeNumber,
    route_name: report.routeName,
    stop_name: report.stopName,
    travel_period: report.travelPeriod,
    crowd_level: report.crowdLevel,
    description: report.description,
    submitted_at: report.submittedAt,
    status: report.status,
  };
  const { error } = await supabase.from('crowd_reports').insert(row);
  if (error) return { error: error.message };
  return {};
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('crowd_reports')
    .update({ status })
    .eq('id', id);
  if (error) return { error: error.message };
  return {};
}

export async function deleteReport(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('crowd_reports').delete().eq('id', id);
  if (error) return { error: error.message };
  return {};
}

export async function deleteAllReports(): Promise<{ error?: string }> {
  const { error } = await supabase.from('crowd_reports').delete().neq('id', '');
  if (error) return { error: error.message };
  return {};
}

// ---- Notifications ----

export async function fetchNotifications(): Promise<{
  data: AppNotification[];
  error?: string;
}> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data as NotificationRow[]).map(rowToNotification) };
}

export async function insertNotification(
  n: AppNotification
): Promise<{ error?: string }> {
  const row = {
    id: n.id,
    title: n.title,
    description: n.description,
    category: n.category,
    created_at: n.createdAt,
    read: n.read,
    related_report_id: n.relatedReportId ?? null,
  };
  const { error } = await supabase.from('notifications').insert(row);
  if (error) return { error: error.message };
  return {};
}

export async function markNotificationReadDb(
  id: string,
  read: boolean
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('notifications')
    .update({ read })
    .eq('id', id);
  if (error) return { error: error.message };
  return {};
}

export async function markAllNotificationsReadDb(
  ids: string[]
): Promise<{ error?: string }> {
  if (ids.length === 0) return {};
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .in('id', ids);
  if (error) return { error: error.message };
  return {};
}

export async function deleteNotificationsForReport(
  reportId: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('related_report_id', reportId);
  if (error) return { error: error.message };
  return {};
}

export async function deleteAllNotifications(): Promise<{ error?: string }> {
  const { error } = await supabase.from('notifications').delete().neq('id', '');
  if (error) return { error: error.message };
  return {};
}
