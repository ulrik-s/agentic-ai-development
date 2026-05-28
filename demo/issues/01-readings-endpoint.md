# #1 — Implement GET /api/readings endpoint

**Type:** backend
**Area:** `demo/sensor-dashboard/server.js`
**Independent:** ✅ (no blockers)

## What

Add a `GET /api/readings` endpoint that returns sensor readings from
`data/readings.json`.

## Query parameters

| param      | type   | description                                          |
|------------|--------|------------------------------------------------------|
| `sensor`   | string | filter by `sensor_id` (e.g. `office-1`)              |
| `type`     | string | filter by sensor type (`temperature` or `humidity`)  |
| `from`     | ISO ts | only include readings at or after this timestamp     |
| `to`       | ISO ts | only include readings at or before this timestamp    |
| `limit`    | number | cap result count (default 500, max 5000)             |

All filters are optional. If none are provided, return the last 500 readings.

## Acceptance

- `curl localhost:3000/api/readings?type=temperature&limit=10` returns 10 rows
- Invalid `limit` (negative, NaN) returns 400 with a JSON error
- Response is `{ count: N, readings: [...] }`
- Readings sorted by `ts` ascending
