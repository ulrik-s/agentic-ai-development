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

checkHealth();
autoReloadCheck();
setInterval(autoReloadCheck, 2000);
