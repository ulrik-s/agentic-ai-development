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

// Issue #4: threshold alerts.
async function refreshAlerts() {
  const list = document.getElementById('alert-list');
  if (!list) return;
  try {
    const r = await fetch('/api/alerts', { cache: 'no-store' });
    const alerts = await r.json();
    list.innerHTML = '';
    if (alerts.length === 0) {
      const li = document.createElement('li');
      li.className = 'alert-empty';
      li.textContent = 'No alert rules yet.';
      list.appendChild(li);
      return;
    }
    for (const a of alerts) {
      const li = document.createElement('li');
      li.className = a.triggered ? 'alert triggered' : 'alert ok';
      const current = a.value === null ? 'no data' : a.value;
      li.innerHTML =
        `<span class="alert-rule">${a.sensor_id} ${a.type} ${a.op} ${a.threshold}</span>` +
        `<span class="alert-status">${a.triggered ? 'TRIGGERED' : 'OK'} (now: ${current})</span>`;
      list.appendChild(li);
    }
  } catch (err) {
    console.error('alerts refresh failed', err);
  }
}

function wireAlertForm() {
  const form = document.getElementById('alert-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      sensor_id: document.getElementById('alert-sensor').value,
      type: document.getElementById('alert-type').value,
      op: document.getElementById('alert-op').value,
      threshold: Number(document.getElementById('alert-threshold').value),
    };
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    form.reset();
    refreshAlerts();
  });
}

checkHealth();
autoReloadCheck();
setInterval(autoReloadCheck, 2000);

wireAlertForm();
refreshAlerts();
setInterval(refreshAlerts, 30000);
