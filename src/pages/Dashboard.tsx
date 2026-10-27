import { useMemo, useState } from 'react';
import {
  Bus,
  MapPin,
  MessageSquareWarning,
  AlertTriangle,
  Plus,
  Route as RouteIcon,
  ListFilter,
  Bell,
  ArrowRight,
  Check,
} from 'lucide-react';
import type { PageKey } from '@/types';
import { useApp } from '@/context/AppContext';
import { busRoutes, totalUniqueStops } from '@/data/routes';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, CrowdLevelBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReportFormModal } from '@/components/ReportFormModal';
import { relativeTime, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';

interface DashboardProps {
  onNavigate: (page: PageKey) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  high_crowd: 'High Crowd',
  report_activity: 'Report Activity',
  informational: 'Informational',
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { reports, notifications, unreadCount, markNotificationRead } = useApp();
  const [reportOpen, setReportOpen] = useState(false);

  const totalRoutes = busRoutes.length;
  const totalStops = totalUniqueStops();
  const totalReports = reports.length;
  const highCrowd = reports.filter((r) => r.crowdLevel === 'High').length;

  const recentReports = useMemo(
    () =>
      [...reports]
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        )
        .slice(0, 5),
    [reports]
  );

  const topNotifications = useMemo(
    () => [...notifications].slice(0, 5),
    [notifications]
  );

  const stats = [
    {
      label: 'Total Routes',
      value: totalRoutes,
      icon: <Bus size={20} />,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Stops',
      value: totalStops,
      icon: <MapPin size={20} />,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Total Crowd Reports',
      value: totalReports,
      icon: <MessageSquareWarning size={20} />,
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'High-Crowd Reports',
      value: highCrowd,
      icon: <AlertTriangle size={20} />,
      tone: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome to your bus dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Find routes, report overcrowding, and track student-submitted
            observations across {totalRoutes} college bus routes.
          </p>
        </div>
        <Button onClick={() => setReportOpen(true)}>
          <Plus size={16} />
          Report Bus Crowd
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-lg',
                  s.tone
                )}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {s.value}
                </p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Quick Actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            label="Report Bus Crowd"
            icon={<Plus size={18} />}
            onClick={() => setReportOpen(true)}
          />
          <QuickAction
            label="Explore Routes"
            icon={<RouteIcon size={18} />}
            onClick={() => onNavigate('routes')}
          />
          <QuickAction
            label="View All Reports"
            icon={<ListFilter size={18} />}
            onClick={() => onNavigate('reports')}
          />
          <QuickAction
            label="View Notifications"
            icon={<Bell size={18} />}
            onClick={() => onNavigate('notifications')}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Important notifications */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Important Notifications
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('notifications')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View all <ArrowRight size={12} />
            </button>
          </CardHeader>
          <CardBody className="space-y-3">
            {topNotifications.length === 0 ? (
              <EmptyState
                title="No notifications yet"
                description="Notifications appear here when students submit crowd reports."
              />
            ) : (
              topNotifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border px-3 py-2.5',
                    n.read
                      ? 'border-gray-100 bg-white'
                      : 'border-blue-100 bg-blue-50/40'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                      {n.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                      <Badge
                        variant={
                          n.category === 'high_crowd'
                            ? 'danger'
                            : n.category === 'informational'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {CATEGORY_LABEL[n.category] ?? n.category}
                      </Badge>
                      <span>{relativeTime(n.createdAt)}</span>
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100"
                      aria-label="Mark as read"
                    >
                      <Check size={12} /> Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Recent crowd reports */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareWarning size={16} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Crowd Reports
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View all <ArrowRight size={12} />
            </button>
          </CardHeader>
          <CardBody className="p-0">
            {recentReports.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No crowd reports yet"
                  description="Submit your first report to see it here and on the Crowd Reports page."
                  action={
                    <Button size="sm" onClick={() => setReportOpen(true)}>
                      <Plus size={14} /> Report Bus Crowd
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Report ID</th>
                      <th className="px-4 py-2.5 font-medium">Route</th>
                      <th className="px-4 py-2.5 font-medium">Stop</th>
                      <th className="px-4 py-2.5 font-medium">Crowd</th>
                      <th className="px-4 py-2.5 font-medium">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentReports.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-gray-600">
                          {r.id}
                        </td>
                        <td className="px-4 py-2.5 text-gray-800">
                          {r.routeName}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">
                          {r.stopName}
                        </td>
                        <td className="px-4 py-2.5">
                          <CrowdLevelBadge level={r.crowdLevel} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-xs text-gray-500">
                          {formatDateTime(r.submittedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <p className="text-xs text-gray-400">
        Showing {unreadCount} unread notification
        {unreadCount === 1 ? '' : 's'}. Reports are stored in the shared
        project database and are visible across students' devices.
      </p>

      <ReportFormModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmitted={() => onNavigate('reports')}
      />
    </div>
  );
}

function QuickAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
          {icon}
        </span>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </span>
      <ArrowRight
        size={16}
        className="text-gray-300 transition group-hover:text-blue-500"
      />
    </button>
  );
}
