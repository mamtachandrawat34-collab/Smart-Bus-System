# DATA_NOTES.md

Notes on uncertain, missing or ambiguous values in the route dataset
(`src/data/Smart_Bus_Route_Data.csv`).

## How the data was handled

- The CSV was parsed during development into the structured file
  `src/data/routes.ts`.
- Original stop names and ordering are preserved exactly as provided.
- The `timing_display` column is shown in the UI; the `source_timing`
  column is kept for traceability.
- The `verification_status` column is respected: `provided_in_source`
  entries are shown normally; `needs_verification` entries are flagged
  with a "Needs verification" / "Verify" badge.
- No missing timings were invented. No ambiguous source values were
  silently corrected.

## Entries that previously needed verification

| Route | Stop | Original timing_display | Updated timing_display | reason |
|------:|------|-------------------------|------------------------|--------|
| 3 | HARI FATHAK | `STOP` | `08:58` | The source value was the literal text "STOP" rather than a time. Verified and updated to 08:58 per user confirmation on 2026-10-27. |

## Placeholder header rows

Several routes begin with a row whose stop name is `BUS STOP` and whose
timing is the literal text `Timing`:

- Route 6, Route 7, Route 8, Route 9, Route 10

These appear to be header/label rows from the original spreadsheet rather
than real stops. They are kept in `routes.ts` for fidelity, but are hidden
from the crowd-report stop picker and visually de-emphasised on the route
detail view (dashed border, reduced opacity).

## Ambiguous source timing values

The `source_timing` column stores times as decimal numbers (e.g. `8.35`
for 08:35, `9.3` for 09:03, `9` for 09:00). These are **kept as-is from
the source** and are NOT reinterpreted. The `timing_display` column
(24-hour HH:MM strings) is what the UI shows to students. If a
`timing_display` value looks incorrect against the `source_timing`, treat
it as needing verification before using it as an official schedule.

Examples of source values that look ambiguous (displayed value comes from
the `timing_display` column, not recalculated here):

- Route 4 / ICE CREAM FACTORY: source `8.4`, display `08:04`
- Route 5 / INDORE GATE: source `8.5`, display `08:05`
- Route 9 / BANGARDA SQ: source `8.2`, display `08:02`
- Route 9 / AUROBINDO: source `8.3`, display `08:03`

These are flagged here so a reviewer can double-check them against the
official college schedule before publishing.

## What was excluded

- Driver phone numbers and any private contact information are NOT
  included anywhere in the app or in `routes.ts`.
- No fake statistics, official delays, cancellations or live locations
  were generated.
