import { useMemo, useState } from 'react';
import {
  Search,
  Bus,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Plus,
} from 'lucide-react';
import type { PageKey } from '@/types';
import { busRoutes } from '@/data/routes';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReportFormModal } from '@/components/ReportFormModal';
import { cn } from '@/lib/cn';

interface RoutesPageProps {
  onNavigate: (page: PageKey) => void;
}

// Stops that are placeholder header rows in the source CSV.
const HIDDEN_HEADER_STOPS = new Set(['BUS STOP', 'Timing']);

function isHeaderStop(name: string) {
  return HIDDEN_HEADER_STOPS.has(name.trim());
}

export function RoutesPage({ onNavigate }: RoutesPageProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'needs_verification' | number>(
    'all'
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return busRoutes.filter((route) => {
      if (filter !== 'all' && filter !== 'needs_verification') {
        if (route.routeNumber !== filter) return false;
      }
      if (filter === 'needs_verification') {
        if (!route.stops.some((s) => s.verificationStatus === 'needs_verification')) {
          return false;
        }
      }
      if (!q) return true;
      const routeMatch =
        route.routeName.toLowerCase().includes(q) ||
        String(route.routeNumber).includes(q);
      const stopMatch = route.stops.some((s) =>
        s.stopName.toLowerCase().includes(q)
      );
      return routeMatch || stopMatch;
    });
  }, [query, filter]);

  const resetFilters = () => {
    setQuery('');
    setFilter('all');
    setExpanded(null);
  };

  const toggle = (num: number) =>
    setExpanded((cur) => (cur === num ? null : num));

  return (
    <div className="space-y-5">
      {/* Controls */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by route number or stop name…"
                className="pl-9"
                aria-label="Search routes and stops"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filter === 'all' ? 'all' : String(filter)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'all' || v === 'needs_verification') setFilter(v);
                  else setFilter(Number(v));
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Filter routes"
              >
                <option value="all">All routes</option>
                {busRoutes.map((r) => (
                  <option key={r.routeNumber} value={r.routeNumber}>
                    {r.routeName}
                  </option>
                ))}
                <option value="needs_verification">
                  Needs verification
                </option>
              </select>
              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw size={14} />
                Reset
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {busRoutes.length} routes. Times are
            from the provided dataset — entries marked{' '}
            <Badge variant="warning">Needs verification</Badge> are unconfirmed.
          </p>
        </CardBody>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bus size={22} />}
          title="No routes match your search"
          description="Try a different route number or stop name, or reset the filters."
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw size={14} /> Reset filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((route) => {
            const isOpen = expanded === route.routeNumber;
            const visibleStops = route.stops.filter(
              (s) => !isHeaderStop(s.stopName)
            );
            const needsVerification = route.stops.some(
              (s) => s.verificationStatus === 'needs_verification'
            );
            return (
              <Card key={route.routeNumber}>
                <button
                  type="button"
                  onClick={() => toggle(route.routeNumber)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-gray-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  aria-expanded={isOpen}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Bus size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {route.routeName}
                      </h3>
                      {needsVerification && (
                        <Badge variant="warning">
                          <AlertTriangle size={11} /> Needs verification
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {visibleStops.length} stops ·{' '}
                      {route.stops.some((s) => s.verificationStatus === 'needs_verification')
                        ? 'Some timings unconfirmed'
                        : 'All timings from source dataset'}
                    </p>
                  </div>
                  <span className="text-gray-400">
                    {isOpen ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/40 px-5 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Stops &amp; timings
                      </h4>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setReportOpen(true);
                        }}
                      >
                        <Plus size={14} /> Report crowd on this route
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {route.stops.map((stop, idx) => {
                        const isHeader = isHeaderStop(stop.stopName);
                        return (
                          <div
                            key={`${stop.stopName}-${idx}`}
                            className={cn(
                              'flex items-center gap-3 rounded-lg border bg-white px-3 py-2',
                              isHeader
                                ? 'border-dashed border-gray-200 opacity-60'
                                : 'border-gray-200',
                              stop.verificationStatus === 'needs_verification' &&
                                'border-amber-200 bg-amber-50/40'
                            )}
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                              <MapPin size={14} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  'truncate text-sm font-medium',
                                  isHeader
                                    ? 'text-gray-400'
                                    : 'text-gray-800'
                                )}
                              >
                                {stop.stopName}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock size={11} />
                                <span>{stop.timingDisplay}</span>
                              </div>
                            </div>
                            {stop.verificationStatus === 'needs_verification' && (
                              <Badge variant="warning">
                                <AlertTriangle size={10} /> Verify
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {needsVerification && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
                        <AlertTriangle size={12} />
                        One or more stop timings on this route need verification
                        before being treated as official.
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ReportFormModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmitted={() => onNavigate('reports')}
      />
    </div>
  );
}
