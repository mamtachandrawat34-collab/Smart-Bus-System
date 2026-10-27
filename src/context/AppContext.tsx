import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppNotification,
  CrowdReport,
  NotificationCategory,
} from '@/types';
import {
  generateNotificationId,
  generateReportId,
} from '@/lib/format';
import {
  deleteAllNotifications,
  deleteAllReports,
  deleteNotificationsForReport,
  deleteReport,
  fetchNotifications,
  fetchReports,
  insertNotification,
  insertReport,
  markAllNotificationsReadDb,
  markNotificationReadDb,
  updateReportStatus,
} from '@/lib/api';

interface NewReportInput {
  routeNumber: number;
  routeName: string;
  stopName: string;
  travelPeriod: CrowdReport['travelPeriod'];
  crowdLevel: CrowdReport['crowdLevel'];
  description: string;
}

interface AppContextValue {
  reports: CrowdReport[];
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  addReport: (input: NewReportInput) => Promise<{ report?: CrowdReport; error?: string }>;
  deleteReport: (id: string) => Promise<{ error?: string }>;
  clearAllReports: () => Promise<{ error?: string }>;
  setReportStatus: (id: string, status: CrowdReport['status']) => Promise<{ error?: string }>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  resetNotificationsForDeletedReport: (reportId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const INFO_NOTIFICATIONS: Omit<AppNotification, 'read'>[] = [
  {
    id: 'info-welcome',
    title: 'Welcome to the Smart College Bus System',
    description:
      'Browse verified route stops and report overcrowding you experience on your college bus.',
    category: 'informational' as NotificationCategory,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'info-data-notice',
    title: 'Route timings are from the provided dataset',
    description:
      'Some stop timings are marked as needing verification. Treat them as unconfirmed until checked.',
    category: 'informational',
    createdAt: new Date().toISOString(),
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Load everything on mount ----
  const refresh = useCallback(async () => {
    setError(null);
    const [reportsRes, notifsRes] = await Promise.all([
      fetchReports(),
      fetchNotifications(),
    ]);

    // Ensure the two informational welcome notices exist in the DB.
    const existingIds = new Set(notifsRes.data.map((n) => n.id));
    const toInsert = INFO_NOTIFICATIONS.filter((n) => !existingIds.has(n.id));
    if (toInsert.length > 0) {
      await Promise.all(
        toInsert.map((n) => insertNotification({ ...n, read: false }))
      );
    }

    if (reportsRes.error) setError(reportsRes.error);
    else setReports(reportsRes.data);

    if (notifsRes.error) setError(notifsRes.error);
    else setNotifications(notifsRes.data);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await refresh();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // ---- Reports ----
  const addReport = useCallback(
    async (
      input: NewReportInput
    ): Promise<{ report?: CrowdReport; error?: string }> => {
      const report: CrowdReport = {
        id: generateReportId(),
        routeNumber: input.routeNumber,
        routeName: input.routeName,
        stopName: input.stopName,
        travelPeriod: input.travelPeriod,
        crowdLevel: input.crowdLevel,
        description: input.description.trim(),
        submittedAt: new Date().toISOString(),
        status: 'New',
      };

      const { error: insertErr } = await insertReport(report);
      if (insertErr) return { error: insertErr };

      // Optimistically add to local state so the UI updates immediately.
      setReports((prev) => [report, ...prev]);

      // Generate an application event notification.
      const isHigh = report.crowdLevel === 'High';
      const notif: AppNotification = {
        id: generateNotificationId('evt'),
        title: isHigh ? 'High crowd reported' : 'Crowd report submitted',
        description: isHigh
          ? `Route ${report.routeName} at ${report.stopName || 'a stop'} was reported as highly crowded (${report.travelPeriod}).`
          : `A ${report.crowdLevel.toLowerCase()} crowd report for Route ${report.routeName} was recorded.`,
        category: isHigh ? 'high_crowd' : 'report_activity',
        createdAt: report.submittedAt,
        read: false,
        relatedReportId: report.id,
      };
      const { error: notifErr } = await insertNotification(notif);
      if (notifErr) return { error: notifErr };

      setNotifications((prev) => [notif, ...prev]);
      return { report };
    },
    []
  );

  const deleteReportAsync = useCallback(
    async (id: string): Promise<{ error?: string }> => {
      const { error: delErr } = await deleteReport(id);
      if (delErr) return { error: delErr };
      setReports((prev) => prev.filter((r) => r.id !== id));
      await deleteNotificationsForReport(id);
      setNotifications((prev) =>
        prev.filter((n) => n.relatedReportId !== id)
      );
      return {};
    },
    []
  );

  const clearAllReports = useCallback(async (): Promise<{ error?: string }> => {
    const { error: delErr } = await deleteAllReports();
    if (delErr) return { error: delErr };
    setReports([]);
    await deleteAllNotifications();
    setNotifications([]);
    return {};
  }, []);

  const setReportStatus = useCallback(
    async (
      id: string,
      status: CrowdReport['status']
    ): Promise<{ error?: string }> => {
      const { error: updErr } = await updateReportStatus(id, status);
      if (updErr) return { error: updErr };
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      return {};
    },
    []
  );

  // ---- Notifications ----
  const markNotificationRead = useCallback(
    async (id: string): Promise<void> => {
      // Optimistic update for snappy UI.
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      await markNotificationReadDb(id, true);
    },
    []
  );

  const markAllNotificationsRead = useCallback(async (): Promise<void> => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsReadDb(unreadIds);
  }, [notifications]);

  const resetNotificationsForDeletedReport = useCallback(
    async (reportId: string): Promise<void> => {
      await deleteNotificationsForReport(reportId);
      setNotifications((prev) =>
        prev.filter((n) => n.relatedReportId !== reportId)
      );
    },
    []
  );

  const value: AppContextValue = {
    reports,
    notifications,
    unreadCount,
    loading,
    error,
    addReport,
    deleteReport: deleteReportAsync,
    clearAllReports,
    setReportStatus,
    markNotificationRead,
    markAllNotificationsRead,
    resetNotificationsForDeletedReport,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
