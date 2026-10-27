import {
  Bus,
  Target,
  Users,
  CheckCircle2,
  Cpu,
  AlertCircle,
  Rocket,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function AboutPage() {
  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Bus size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Smart College Bus Management System
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              A college project prototype that helps students find bus routes
              and report overcrowding they experience on their daily commute.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="info">Prototype</Badge>
              <Badge variant="neutral">College project</Badge>
              <Badge variant="accent">React + TypeScript</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Target size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Problem statement
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600">
              College students often do not have a single, easy place to check
              bus routes, stops and timings. When buses are crowded, there is no
              simple way to share that observation so other students can plan
              ahead. This project addresses that gap with a clear, focused
              dashboard.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Target size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Project objective
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600">
              Build a clean, easy-to-use web app where students can find college
              bus routes and stops, search and filter route information, report
              bus overcrowding, view and filter submitted reports, and receive
              clear in-app notifications based on application events.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Target users
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
              <li>College students who travel by college bus.</li>
              <li>
                Faculty and student coordinators reviewing crowd observations
                (prototype scope).
              </li>
              <li>Project reviewers evaluating a transport-management UI.</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Implemented features
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
              <li>Dashboard with live statistics from route and report data.</li>
              <li>Bus Routes page with route &amp; stop search and filters.</li>
              <li>Expandable routes showing stops and available timings.</li>
              <li>Crowd report form with route-dependent stop selection.</li>
              <li>Crowd Reports page with search, filters, sort and delete.</li>
              <li>Notification centre generated from real app events.</li>
              <li>Supabase database persistence for reports and notifications (shared across devices).</li>
              <li>Responsive layout for desktop, tablet and mobile.</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Cpu size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Technologies used
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
              <li>React with TypeScript</li>
              <li>Vite as the build tool</li>
              <li>Tailwind CSS for styling</li>
              <li>Lucide React for icons</li>
              <li>Supabase (Postgres) for shared report and notification persistence</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Current limitations
            </h3>
          </CardHeader>
          <CardBody>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
              <li>
                Report statuses are prototype labels and do not imply staff
                review.
              </li>
              <li>
                No secure staff login — report statuses are prototype labels.
              </li>
              <li>No live GPS tracking or official transport announcements.</li>
              <li>
                Some stop timings in the dataset need verification (see
                DATA_NOTES.md).
              </li>
              <li>Route data is loaded from a static dataset, not a live feed.</li>
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <Rocket size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Future scope
          </h3>
        </CardHeader>
        <CardBody>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
            <li>Secure staff login with verified report review.</li>
            <li>Verified GPS integration for live bus tracking.</li>
            <li>Official transport announcements and delay notifications.</li>
            <li>Role-based access for coordinators and transport staff.</li>
          </ul>
          <p className="mt-3 text-xs text-gray-400">
            These are future features and are not implemented in this prototype.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
