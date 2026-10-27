import { useMemo, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  MessageSquareWarning,
  Info,
} from 'lucide-react';
import type { NotificationCategory } from '@/types';
import { useApp } from '@/context/AppContext';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime, relativeTime } from '@/lib/format';
import { cn } from '@/lib/cn';

const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; icon: React.ReactNode; variant: 'danger' | 'neutral' | 'info' }
> = {
  high_crowd: {
    label: 'High Crowd',
    icon: <AlertTriangle size={16} />,
    variant: 'danger',
  },
  report_activity: {
    label: 'Report Activity',
    icon: <MessageSquareWarning size={16} />,
    variant: 'neutral',
  },
  informational: {
    label: 'Informational',
    icon: <Info size={16} />,
    variant: 'info',
  },
};

type Filter = 'all' | 'unread' | NotificationCategory;

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return [...notifications]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .filter((n) => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.category === filter;
      });
  }, [notifications, filter]);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    {
      key: 'high_crowd',
      label: 'High Crowd',
      count: notifications.filter((n) => n.category === 'high_crowd').length,
    },
    {
      key: 'report_activity',
      label: 'Report Activity',
      count: notifications.filter((n) => n.category === 'report_activity')
        .length,
    },
    {
      key: 'informational',
      label: 'Informational',
      count: notifications.filter((n) => n.category === 'informational')
        .length,
    },
  ];

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Notification Centre
            </h3>
            <Badge variant="info">{unreadCount} unread</Badge>
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllNotificationsRead}>
              <CheckCheck size={14} /> Mark all as read
            </Button>
          )}
        </CardHeader>
        <CardBody className="p-0">
          <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 py-3">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
                  filter === t.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {t.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px]',
                    filter === t.key
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-gray-500'
                  )}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                Loading notifications…
              </div>
            ) : error ? (
              <div className="py-6 text-sm text-rose-600">
                Could not load notifications: {error}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Bell size={22} />}
                title={
                  filter === 'unread'
                    ? 'No unread notifications'
                    : 'No notifications in this category'
                }
                description={
                  filter === 'unread'
                    ? 'You are all caught up. New notifications appear when students submit crowd reports.'
                    : 'Try a different category tab.'
                }
              />
            ) : (
              <ul className="space-y-2">
                {filtered.map((n) => {
                  const meta = CATEGORY_META[n.category];
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border px-4 py-3 transition',
                        n.read
                          ? 'border-gray-100 bg-white'
                          : 'border-blue-100 bg-blue-50/40'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          n.category === 'high_crowd'
                            ? 'bg-rose-100 text-rose-600'
                            : n.category === 'informational'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {meta.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-600">
                          {n.description}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                          <span title={formatDateTime(n.createdAt)}>
                            {relativeTime(n.createdAt)}
                          </span>
                        </div>
                      </div>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(n.id)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100"
                        >
                          <Check size={12} /> Mark read
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </CardBody>
      </Card>

      <p className="text-xs text-gray-400">
        Notifications are generated from real application events only and
        stored in the shared project database.
      </p>
    </div>
  );
}
