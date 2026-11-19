// Shared types for the Smart College Bus Management System.

export type VerificationStatus = 'provided_in_source' | 'needs_verification';

export interface RouteStop {
  stopName: string;
  timingDisplay: string;
  sourceTiming: string;
  verificationStatus: VerificationStatus;
}

export interface BusRoute {
  routeNumber: number;
  routeName: string;
  stops: RouteStop[];
}

export type CrowdLevel = 'Low' | 'Medium' | 'High';

export type TravelPeriod = 'Morning' | 'Afternoon' | 'Evening';

export type ReportStatus = 'New' | 'Under Review' | 'Acknowledged';

export interface CrowdReport {
  id: string;
  routeNumber: number;
  routeName: string;
  stopName: string;
  travelPeriod: TravelPeriod;
  crowdLevel: CrowdLevel;
  description: string;
  submittedAt: string; // ISO timestamp
  status: ReportStatus;
  submittedBy?: string | null;
}

export type NotificationCategory =
  | 'high_crowd'
  | 'report_activity'
  | 'informational';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  createdAt: string; // ISO timestamp
  read: boolean;
  relatedReportId?: string;
}

// ---- Auth ----

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
}

// ---- Issue reports (maintenance + cleanliness) ----

export type IssueStatus = 'Submitted' | 'In Progress' | 'Resolved';

export type IssueReportType = 'maintenance' | 'cleanliness';

export type MaintenanceCategory =
  | 'breakdown'
  | 'damaged_seats'
  | 'faulty_doors_windows'
  | 'water_leakage'
  | 'other';

export type CleanlinessCategory =
  | 'dirty_seats'
  | 'unclean_floors'
  | 'litter'
  | 'bad_smell'
  | 'other';

export interface IssueReport {
  id: string;
  type: IssueReportType;
  reporterId: string;
  routeNumber: number;
  routeName: string;
  busIdentifier: string;
  category: string;
  description: string;
  photoPath: string | null;
  photoUrl?: string | null;
  status: IssueStatus;
  submittedAt: string;
}

// ---- Drivers ----

export interface DriverContact {
  id: string;
  routeNumber: number;
  driverName: string;
  driverPhone: string;
  updatedAt: string;
}

export type PageKey =
  | 'dashboard'
  | 'routes'
  | 'reports'
  | 'notifications'
  | 'admin';
