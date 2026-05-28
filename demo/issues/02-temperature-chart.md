# #2 — Temperature chart on the dashboard

**Type:** frontend
**Area:** `demo/sensor-dashboard/public/`
**Depends on:** #1 (the readings endpoint)

## What

Render a line chart of temperature readings on the dashboard, one line per
sensor.

## Details

- Use Chart.js (already loaded via CDN in `index.html`)
- Fetch `/api/readings?type=temperature&limit=2000` on page load
- Group readings by `sensor_id`, one dataset per sensor
- X-axis: time. Y-axis: °C.
- Auto-refresh every 30 seconds

## Acceptance

- The empty-state message is replaced by the chart
- Three lines visible (office-1, office-2, lobby)
- Y-axis labelled "°C"
- Chart updates without a full page reload
