// Bootstrap. Agents add chart rendering, alerts UI, etc.

async function checkHealth() {
  try {
    const r = await fetch('/api/health');
    const data = await r.json();
    console.log('health', data);
  } catch (err) {
    console.error('health check failed', err);
  }
}

// Live-reload during the demo: poll /api/version every 2 seconds, reload
// the page whenever the version changes (file added/modified or server
// restarted by nodemon). Soft — only reloads when something actually moved.
let _initialVersion = null;
async function autoReloadCheck() {
  try {
    const r = await fetch('/api/version', { cache: 'no-store' });
    if (!r.ok) return;
    const { version } = await r.json();
    if (_initialVersion === null) {
      _initialVersion = version;
    } else if (version !== _initialVersion) {
      console.log('reload: version changed', _initialVersion, '→', version);
      location.reload();
    }
  } catch (_) { /* server restarting — wait for next tick */ }
}

// --- Temperature chart (issue #2) ---

const LINE_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed'];

// Issue #1 (the /api/readings endpoint) may not be merged yet. Fetch the
// real endpoint, and fall back to mock data of the exact response shape so
// the chart renders during the demo until the backend lands.
async function fetchReadings() {
  try {
    const r = await fetch('/api/readings?type=temperature&limit=2000', { cache: 'no-store' });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch (_) { /* fall through to mock */ }
  return mockReadings();
}

function mockReadings() {
  const sensors = [
    { id: 'office-1', base: 21.6 },
    { id: 'office-2', base: 22.1 },
    { id: 'lobby', base: 19.9 },
  ];
  const out = [];
  const now = Date.now();
  const points = 100;
  const stepMs = 10 * 60 * 1000;
  for (let i = points - 1; i >= 0; i--) {
    const ts = new Date(now - i * stepMs).toISOString();
    for (const s of sensors) {
      out.push({
        ts,
        sensor_id: s.id,
        type: 'temperature',
        unit: '°C',
        value: +(s.base + Math.sin(i / 6) + (Math.random() - 0.5)).toFixed(2),
      });
    }
  }
  return out;
}

// Build shared time labels + one value series per sensor. All sensors share
// the same timestamps, so a category x-axis keeps the lines aligned without
// pulling in a Chart.js date adapter.
function toChartData(readings) {
  const labels = [...new Set(readings.map((r) => r.ts))].sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const fmt = (ts) =>
    new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const bySensor = new Map();
  for (const r of readings) {
    if (!bySensor.has(r.sensor_id)) bySensor.set(r.sensor_id, new Map());
    bySensor.get(r.sensor_id).set(r.ts, r.value);
  }

  let i = 0;
  const datasets = [...bySensor.entries()].map(([sensor, values]) => {
    const color = LINE_COLORS[i++ % LINE_COLORS.length];
    return {
      label: sensor,
      data: labels.map((ts) => (values.has(ts) ? values.get(ts) : null)),
      borderColor: color,
      backgroundColor: color,
      tension: 0.3,
      pointRadius: 0,
      spanGaps: true,
    };
  });

  return { labels: labels.map(fmt), datasets };
}

let temperatureChart = null;

async function renderTemperatureChart() {
  const readings = await fetchReadings();
  const { labels, datasets } = toChartData(readings);

  if (temperatureChart) {
    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets = datasets;
    temperatureChart.update();
    return;
  }

  document.getElementById('empty-state')?.remove();

  const ctx = document.getElementById('temperature-chart');
  temperatureChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { title: { display: true, text: 'Time' }, ticks: { maxTicksLimit: 8 } },
        y: { title: { display: true, text: '°C' } },
      },
    },
  });
}

checkHealth();
autoReloadCheck();
setInterval(autoReloadCheck, 2000);

renderTemperatureChart();
setInterval(renderTemperatureChart, 30000);
