import type { BusRoute, RouteStop, VerificationStatus } from '@/types';

// Structured route data parsed from src/data/Smart_Bus_Route_Data.csv.
// Original source values are preserved exactly, including entries that
// require verification. Do NOT treat these timings as official college
// schedules — see DATA_NOTES.md for uncertain values.

type RawStop = [stopName: string, timingDisplay: string, sourceTiming: string, status: VerificationStatus];

const rawStops: Record<number, RawStop[]> = {
  1: [
    ['MOHAN NAGAR', '08:35', '8.35', 'provided_in_source'],
    ['INDIRA NAGAR', '08:37', '8.37', 'provided_in_source'],
    ['JAAT DHARMSHALA', '08:41', '8.41', 'provided_in_source'],
    ['MANGALNATH SQ', '08:43', '8.43', 'provided_in_source'],
    ['INDIRA NAGAR -II SQ', '08:48', '8.48', 'provided_in_source'],
    ['BEEMA', '08:52', '8.52', 'provided_in_source'],
    ['KOYLA FATAK', '08:55', '8.55', 'provided_in_source'],
    ['CHAMUNDA MATA SQ', '08:57', '8.57', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
  2: [
    ['MAXI ROAD Gopal pura', '08:04', '8.4', 'provided_in_source'],
    ['SETHI NAGAR - COW SQ', '08:45', '8.45', 'provided_in_source'],
    ['GHAS MANDI', '08:51', '8.51', 'provided_in_source'],
    ['TOWER', '08:52', '8.52', 'provided_in_source'],
    ['ABHINANDAN', '08:55', '8.55', 'provided_in_source'],
    ['RISHI NAGAR', '09:02', '9.02', 'provided_in_source'],
    ['RTO', '09:04', '9.04', 'provided_in_source'],
    ['TRAFIC THANA,', '09:05', '9.05', 'provided_in_source'],
    ['KSHIPRA HOTEL', '09:06', '9.06', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
  3: [
    ['NIKAS', '08:04', '8.4', 'provided_in_source'],
    ['KANTHAL', '08:42', '8.42', 'provided_in_source'],
    ['POWER HOUSE', '08:45', '8.45', 'provided_in_source'],
    ['GADA PULIYA', '08:55', '8.55', 'provided_in_source'],
    ['HARI FATHAK', '08:58', '8.58', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
  4: [
    ['ABHILASHA', '08:35', '8.35', 'provided_in_source'],
    ['ICREAM FACTORY', '08:04', '8.4', 'provided_in_source'],
    ['NAGZIRI', '08:44', '8.44', 'provided_in_source'],
    ['MAHANANDA', '08:46', '8.46', 'provided_in_source'],
    ['COSMOS MALL', '08:58', '8.58', 'provided_in_source'],
    ['C21 SUBKUCH ST KABIR NGR', '09:00', '9', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
  5: [
    ['ATLAS', '08:45', '8.45', 'provided_in_source'],
    ['DAULATGANJ', '08:48', '8.48', 'provided_in_source'],
    ['INDORE GATE', '08:05', '8.5', 'provided_in_source'],
    ['DEWAS GATE', '08:53', '8.53', 'provided_in_source'],
    ['CHANUNDA MATA', '08:55', '8.55', 'provided_in_source'],
    ['BENGALI COLONY', '08:57', '8.57', 'provided_in_source'],
    ['UTKARSH - SHASTRI NGR', '09:00', '9', 'provided_in_source'],
    ['NEEL GANGA', '09:02', '9.02', 'provided_in_source'],
    ['MANCHAMAN SQ', '09:05', '9.05', 'provided_in_source'],
    ['HARI FATAK', '09:08', '9.08', 'provided_in_source'],
    ['JANTAR MANTAR', '09:08', '9.08', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
  6: [
    ['BUS STOP', 'Timing', 'Timing', 'provided_in_source'],
    ['DMART', '08:05', '8.5', 'provided_in_source'],
    ['LALGATE', '08:55', '8.55', 'provided_in_source'],
    ['NANAKHEDA', '09:00', '9', 'provided_in_source'],
    ['SHANTI PALACE', '09:05', '9.05', 'provided_in_source'],
    ['HATKESHWAR', '09:09', '9.09', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
  7: [
    ['BUS STOP', 'Timing', 'Timing', 'provided_in_source'],
    ['NANAKHEDA', '09:00', '9', 'provided_in_source'],
    ['SHANTI PALACE', '09:05', '9.05', 'provided_in_source'],
    ['HATKESHWAR', '09:09', '9.09', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
  8: [
    ['BUS STOP', 'Timing', 'Timing', 'provided_in_source'],
    ['TOWER', '08:45', '8.45', 'provided_in_source'],
    ['TEEN BATTI', '08:47', '8.47', 'provided_in_source'],
    ['SINDHI COLONY', '08:58', '8.58', 'provided_in_source'],
    ['APOLO TYRE ALAKHDHAM', '08:05', '8.5', 'provided_in_source'],
    ['DO TALAV', '08:52', '8.52', 'provided_in_source'],
    ['DESHMUKH HOSPITAL', '08:55', '8.55', 'provided_in_source'],
    ['NANKHEDA', '09:00', '9', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
  9: [
    ['BUS STOP', 'Timing', 'Timing', 'provided_in_source'],
    ['RAU', '07:45', '7.45', 'provided_in_source'],
    ['RAJENDRA NAGAR', '07:48', '7.48', 'provided_in_source'],
    ['CHOITHRAM MANDI SQ', '07:05', '7.5', 'provided_in_source'],
    ['AMBIKAPURI', '07:53', '7.53', 'provided_in_source'],
    ['ANNAPURNA', '08:00', '8', 'provided_in_source'],
    ['DASHERA MAIDAN', '08:02', '8.02', 'provided_in_source'],
    ['MHOW NAKA', '08:05', '8.05', 'provided_in_source'],
    ['RAJMOHALLA', '08:05', '8.05', 'provided_in_source'],
    ['BADA GANPATI', '08:05', '8.05', 'provided_in_source'],
    ['GITANJALI HOSPITAL', '08:08', '8.08', 'provided_in_source'],
    ['KALANI NAGAR', '08:01', '8.1', 'provided_in_source'],
    ['BSF', '08:12', '8.12', 'provided_in_source'],
    ['GANDHI NAGAR', '08:15', '8.15', 'provided_in_source'],
    ['BANGARDA SQ', '08:02', '8.2', 'provided_in_source'],
    ['AUROBINDO', '08:03', '8.3', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
  10: [
    ['BUS STOP', 'Timing', 'Timing', 'provided_in_source'],
    ['AGRICULTURE COLLAGE', '07:05', '7.5', 'provided_in_source'],
    ['PIPLIYAHANA GAON', '07:52', '7.52', 'provided_in_source'],
    ['WORLDCUP SQ', '07:55', '7.55', 'provided_in_source'],
    ['BENGALI SQ', '08:00', '8', 'provided_in_source'],
    ['RADDISION SQ', '08:08', '8.08', 'provided_in_source'],
    ['VIJAY NAGAR', '08:01', '8.1', 'provided_in_source'],
    ['MEGHDOOT', '08:13', '8.13', 'provided_in_source'],
    ['BAPAT SQ', '08:15', '8.15', 'provided_in_source'],
    ['HEERA NAGAR', '08:18', '8.18', 'provided_in_source'],
    ['MR 10', '08:22', '8.22', 'provided_in_source'],
    ['AUROBINDO', '08:03', '8.3', 'provided_in_source'],
    ['RAGHAV PIPLIYA', '09:01', '9.1', 'provided_in_source'],
    ['DIRECT CAMPUS', '09:03', '9.3', 'provided_in_source'],
  ],
};

const routeNames: Record<number, string> = {
  1: 'Route 1',
  2: 'Route 2',
  3: 'Route 3',
  4: 'Route 4',
  5: 'Route 5',
  6: 'Route 6',
  7: 'Route 7',
  8: 'Route 8',
  9: 'Route 9',
  10: 'Route 10',
};

function buildRoutes(): BusRoute[] {
  return Object.keys(rawStops)
    .map(Number)
    .sort((a, b) => a - b)
    .map((num) => {
      const stops: RouteStop[] = rawStops[num].map(
        ([stopName, timingDisplay, sourceTiming, verificationStatus]) => ({
          stopName,
          timingDisplay,
          sourceTiming,
          verificationStatus,
        })
      );
      return {
        routeNumber: num,
        routeName: routeNames[num] ?? `Route ${num}`,
        stops,
      };
    });
}

export const busRoutes: BusRoute[] = buildRoutes();

export function getRouteByNumber(num: number): BusRoute | undefined {
  return busRoutes.find((r) => r.routeNumber === num);
}

export function getStopsForRoute(num: number): RouteStop[] {
  return getRouteByNumber(num)?.stops ?? [];
}

// Total unique stop count across all routes (a stop name appearing on
// multiple routes is counted once per route occurrence to reflect the
// dataset, but the dashboard reports the de-duplicated unique count).
export function totalUniqueStops(): number {
  const names = new Set<string>();
  busRoutes.forEach((r) =>
    r.stops.forEach((s) => names.add(s.stopName.trim().toUpperCase()))
  );
  return names.size;
}

// Stops that should be hidden from the crowd-report stop picker because
// they are placeholder "BUS STOP" / "Timing" header rows in the source.
const HIDDEN_PICKER_STOPS = new Set(['BUS STOP', 'Timing']);

export function pickableStopsForRoute(num: number): RouteStop[] {
  return getStopsForRoute(num).filter(
    (s) =>
      !HIDDEN_PICKER_STOPS.has(s.stopName.trim()) &&
      s.stopName.trim().length > 0
  );
}
