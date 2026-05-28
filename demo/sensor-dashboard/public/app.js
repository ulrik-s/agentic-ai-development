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
