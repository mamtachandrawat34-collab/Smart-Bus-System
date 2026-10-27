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
  status: ReportStatus; // Prototype status — not a verified staff review
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

export type PageKey =
  | 'dashboard'
  | 'routes'
  | 'reports'
  | 'notifications'
  | 'about';
