import { useMemo, useState } from 'react';
import {
  Search,
  Trash2,
  Plus,
  Eye,
  RotateCcw,
  Filter,
  MessageSquareWarning,
} from 'lucide-react';
import type { CrowdLevel, CrowdReport, ReportStatus } from '@/types';
import { busRoutes } from '@/data/routes';
import { useApp } from '@/context/AppContext';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput, Select, TextArea } from '@/components/ui/Field';
import { Badge, CrowdLevelBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ReportFormModal } from '@/components/ReportFormModal';
import { useToast } from '@/context/ToastContext';
import { formatDateTime } from '@/lib/format';

const CROWD_LEVELS: CrowdLevel[] = ['Low', 'Medium', 'High'];
const STATUSES: ReportStatus[] = ['New', 'Under Review', 'Acknowledged'];

export function ReportsPage() {
  const { reports, loading, error, deleteReport, clearAllReports, setReportStatus } =
    useApp();
  const { pushToast } = useToast();

  const [query, setQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState<'all' | number>('all');
  const [crowdFilter, setCrowdFilter] = useState<'all' | CrowdLevel>('all');
  const [reportOpen, setReportOpen] = useState(false);
  const [viewing, setViewing] = useState<CrowdReport | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...reports]
      .filter((r) => {
        if (routeFilter !== 'all' && r.routeNumber !== routeFilter) return false;
        if (crowdFilter !== 'all' && r.crowdLevel !== crowdFilter) return false;
        if (!q) return true;
        return (
          r.id.toLowerCase().includes(q) ||
          r.routeName.toLowerCase().includes(q) ||
          String(r.routeNumber).includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
  }, [reports, query, routeFilter, crowdFilter]);

  const resetFilters = () => {
    setQuery('');
    setRouteFilter('all');
    setCrowdFilter('all');
  };

  const confirmDelete = async () => {
    if (!deletingId || busy) return;
    setBusy(true);
    const res = await deleteReport(deletingId);
    setBusy(false);
    setDeletingId(null);
    if (res.error) {
      pushToast({ variant: 'error', title: 'Could not delete', message: res.error });
      return;
    }
    pushToast({
      variant: 'info',
      title: 'Report deleted',
      message: 'The report was removed.',
    });
  };

  const confirmClear = async () => {
    if (busy) return;
    setBusy(true);
    const res = await clearAllReports();
    setBusy(false);
    setClearOpen(false);
    if (res.error) {
      pushToast({ variant: 'error', title: 'Could not clear reports', message: res.error });
      return;
    }
    pushToast({
      variant: 'info', title: 'All reports cleared', message: 'The report list is now empty.' });
  };

  const counts = {
    total: reports.length,
    filtered: filtered.length,
    low: reports.filter((r) => r.crowdLevel === 'Low').length,
    medium: reports.filter((r) => r.crowdLevel === 'Medium').length,
    high: reports.filter((r) => r.crowdLevel === 'High').length,
  };

  return (
    <div className="space-y-5">
      {/* Controls + counts */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Search &amp; filter reports
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setReportOpen(true)}>
              <Plus size={14} /> New Report
            </Button>
            {reports.length > 0 && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setClearOpen(true)}
              >
                <Trash2 size={14} /> Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative sm:col-span-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by report ID or route…"
                className="pl-9"
                aria-label="Search reports"
              />
            </div>
            <Select
              value={routeFilter === 'all' ? 'all' : String(routeFilter)}
              onChange={(e) =>
                setRouteFilter(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              aria-label="Filter by route"
            >
              <option value="all">All routes</option>
              {busRoutes.map((r) => (
                <option key={r.routeNumber} value={r.routeNumber}>
                  {r.routeName}
                </option>
              ))}
            </Select>
            <Select
              value={crowdFilter}
              onChange={(e) =>
                setCrowdFilter(
                  e.target.value === 'all' ? 'all' : (e.target.value as CrowdLevel)
                )
              }
              aria-label="Filter by crowd level"
            >
              <option value="all">All crowd levels</option>
              {CROWD_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="info">{counts.total} total</Badge>
              <Badge variant="success">Low: {counts.low}</Badge>
              <Badge variant="warning">Medium: {counts.medium}</Badge>
              <Badge variant="danger">High: {counts.high}</Badge>
              <span className="text-gray-400">
                {counts.filtered} shown
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw size={14} /> Reset
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Reports list */}
      {loading ? (
        <Card>
          <CardBody className="flex items-center justify-center py-10 text-sm text-gray-400">
            Loading reports…
          </CardBody>
        </Card>
      ) : error ? (
        <Card>
          <CardBody className="py-6 text-sm text-rose-600">
            Could not load reports: {error}
          </CardBody>
        </Card>
      ) : filtered.length === 0 ? (
        reports.length === 0 ? (
          <EmptyState
            icon={<MessageSquareWarning size={22} />}
            title="No crowd reports yet"
            description="Submit your first crowd report to start tracking overcrowding observations."
            action={
              <Button size="sm" onClick={() => setReportOpen(true)}>
                <Plus size={14} /> Report Bus Crowd
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<Search size={22} />}
            title="No reports match your filters"
            description="Try adjusting your search or filters, or reset them."
            action={
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw size={14} /> Reset filters
              </Button>
            }
          />
        )
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Report ID</th>
                    <th className="px-4 py-3 font-medium">Route</th>
                    <th className="px-4 py-3 font-medium">Stop</th>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Crowd</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">
                        {r.id}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{r.routeName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.stopName}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.travelPeriod}
                      </td>
                      <td className="px-4 py-3">
                        <CrowdLevelBadge level={r.crowdLevel} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                        {formatDateTime(r.submittedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewing(r)}
                          >
                            <Eye size={14} /> View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingId(r.id)}
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((r) => (
              <Card key={r.id}>
                <CardBody className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">
                      {r.id}
                    </span>
                    <CrowdLevelBadge level={r.crowdLevel} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      {r.routeName}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    Stop: {r.stopName} · {r.travelPeriod}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(r.submittedAt)}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewing(r)}
                    >
                      <Eye size={14} /> View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(r.id)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-gray-400">
        Report statuses are prototype labels only — they do not imply that
        college staff have reviewed a report.
      </p>

      {/* Modals */}
      <ReportFormModal open={reportOpen} onClose={() => setReportOpen(false)} />

      <ReportDetailModal
        report={viewing}
        onClose={() => setViewing(null)}
        onStatusChange={async (s) => {
          if (viewing) {
            const res = await setReportStatus(viewing.id, s);
            if (res.error) {
              pushToast({ variant: 'error', title: 'Could not update status', message: res.error });
              return;
            }
            setViewing({ ...viewing, status: s });
          }
        }}
        onDelete={() => {
          if (viewing) {
            setDeletingId(viewing.id);
            setViewing(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete this report?"
        message="This will permanently remove the report from the database. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />

      <ConfirmDialog
        open={clearOpen}
        title="Clear all reports?"
        message={`This will permanently remove all ${reports.length} report${reports.length === 1 ? '' : 's'} from the database. This action cannot be undone.`}
        confirmLabel="Clear all"
        destructive
        onConfirm={confirmClear}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const variant =
    status === 'New'
      ? 'info'
      : status === 'Under Review'
      ? 'warning'
      : 'success';
  return <Badge variant={variant}>{status}</Badge>;
}

function ReportDetailModal({
  report,
  onClose,
  onStatusChange,
  onDelete,
}: {
  report: CrowdReport | null;
  onClose: () => void;
  onStatusChange: (s: ReportStatus) => void;
  onDelete: () => void;
}) {
  if (!report) return null;
  return (
    <Modal
      open={!!report}
      onClose={onClose}
      title={`Report ${report.id}`}
      description="Student-submitted observation — not verified official bus information."
      size="lg"
      footer={
        <>
          <Button variant="danger" onClick={onDelete}>
            <Trash2 size={14} /> Delete
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow label="Route" value={report.routeName} />
          <DetailRow label="Stop" value={report.stopName} />
          <DetailRow label="Travel period" value={report.travelPeriod} />
          <DetailRow
            label="Crowd level"
            value={<CrowdLevelBadge level={report.crowdLevel} />}
          />
          <DetailRow label="Submitted" value={formatDateTime(report.submittedAt)} />
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-gray-500">
              Status (prototype)
            </p>
            <Select
              value={report.status}
              onChange={(e) =>
                onStatusChange(e.target.value as ReportStatus)
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase text-gray-500">
            Description
          </p>
          {report.description ? (
            <TextArea
              value={report.description}
              readOnly
              className="bg-gray-50"
            />
          ) : (
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-400">
              No description provided.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  );
}
