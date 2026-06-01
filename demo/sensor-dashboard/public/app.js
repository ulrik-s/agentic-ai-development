// Client-side bootstrap. Agents add chart rendering, alerts UI, dark mode, etc.

async function checkHealth() {
  try {
    const r = await fetch('/api/health');
    const data = await r.json();
    console.log('health', data);
  } catch (err) {
    console.error('health check failed', err);
  }
}

checkHealth();

let tempChart;

function groupBySensor(readings) {
  const bySensor = new Map();
  for (const r of readings) {
    if (!bySensor.has(r.sensor_id)) bySensor.set(r.sensor_id, []);
    bySensor.get(r.sensor_id).push({ x: r.ts, y: r.value });
  }
  return [...bySensor].map(([label, data]) => ({ label, data }));
}

async function loadTemperatureChart() {
  const empty = document.getElementById('temp-empty');
  try {
    const r = await fetch('/api/readings?type=temperature&limit=2000');
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const { readings } = await r.json();
    const datasets = groupBySensor(readings || []);

    if (!datasets.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    if (tempChart) {
      tempChart.data.datasets = datasets;
      tempChart.update();
      return;
    }

    const ctx = document.getElementById('temp-chart');
    tempChart = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        interaction: { mode: 'nearest', intersect: false },
        scales: {
          x: { type: 'time', title: { display: true, text: 'Time' } },
          y: { title: { display: true, text: '°C' } },
        },
      },
    });
  } catch (err) {
    console.error('temperature chart load failed', err);
    if (!tempChart) empty.hidden = false;
  }
}

loadTemperatureChart();
setInterval(loadTemperatureChart, 30000);
