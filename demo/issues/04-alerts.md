# #4 — Threshold alerts

**Type:** full-stack
**Area:** backend + frontend
**Depends on:** #1, and ideally one of #2/#3 to demo against

## What

Let the user define alert rules (e.g. "humidity in office-1 above 50%") and
display active alerts on the dashboard.

## Backend

- `POST /api/alerts` — body `{ sensor_id, type, op: ">" | "<", threshold }`,
  returns the stored rule with an id
- `GET  /api/alerts` — list rules and, for each, whether it is currently
  triggered (based on the latest reading from `data/readings.json`)
- Rules can be kept in memory for the demo — no persistence needed

## Frontend

- A simple form at the top of the dashboard for adding a rule
- A list of active alerts below the charts, highlighted when triggered
- Refresh alert state every 30 seconds

## Acceptance

- Adding a rule via the UI shows it in the alerts list
- A rule that matches current data shows as "triggered"
- A rule that does not match shows as "OK"
