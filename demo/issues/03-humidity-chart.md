# #3 — Humidity chart on the dashboard

**Type:** frontend
**Area:** `demo/sensor-dashboard/public/`
**Depends on:** #1 (the readings endpoint)
**Parallel-safe with:** #2 (different chart, different DOM node)

## What

Same as #2 but for `type=humidity`. Y-axis in `%`.

## Details

- Use Chart.js, same setup as the temperature chart
- Place the humidity chart *below* the temperature chart on the page
- Auto-refresh every 30 seconds, independently of the temperature chart

## Acceptance

- A second chart appears below the temperature chart
- Three lines (office-1, office-2, lobby), Y-axis "%"
- Both charts can refresh without interfering with each other
