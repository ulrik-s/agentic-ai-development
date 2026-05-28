# #5 — Playwright e2e smoke tests

**Type:** testing
**Area:** `demo/sensor-dashboard/tests/`
**Independent:** ✅ (can be written against the contract before features land)

## What

Add Playwright e2e tests that exercise the dashboard end-to-end.

## Setup

- Add `@playwright/test` as a dev dependency
- `tests/` folder at the project root
- `npm test` should run the suite headless

## Tests to include

1. **Health endpoint** — `GET /api/health` returns 200 and `status: "ok"`
2. **Readings endpoint** — `GET /api/readings?limit=5` returns 5 readings
3. **Dashboard renders** — visiting `/` shows the "Sensor Dashboard" heading
4. **Charts present** — after page load, at least one `<canvas>` exists
5. **No console errors** — page load produces no JS console errors

## Acceptance

- `npm test` runs to green
- Tests are short, readable, and not flaky
- Server is auto-started by the test runner (via `webServer` config)
