const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'readings.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const BOOT_TIME = Date.now();

app.use(express.static(PUBLIC_DIR));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Auto-reload signal for the browser: returns a version that bumps whenever
// any file in public/ is modified OR the server restarts (nodemon reload).
app.get('/api/version', (req, res) => {
  let latest = BOOT_TIME;
  try {
    for (const f of fs.readdirSync(PUBLIC_DIR)) {
      const s = fs.statSync(path.join(PUBLIC_DIR, f));
      if (s.mtimeMs > latest) latest = s.mtimeMs;
    }
  } catch (_) { /* ignore */ }
  res.json({ version: latest, boot: BOOT_TIME });
});

// TODO (issue #1): GET /api/readings — return readings from data/readings.json
// Supports query params: ?sensor=<id>&from=<iso>&to=<iso>&limit=<n>

// TODO (issue #4): POST /api/alerts — store a threshold alert rule
// TODO (issue #4): GET  /api/alerts — list active alerts

app.listen(PORT, () => {
  const count = fs.existsSync(DATA_FILE)
    ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')).length
    : 0;
  console.log(`Sensor dashboard listening on http://localhost:${PORT}`);
  console.log(`Loaded ${count} readings from data/readings.json`);
});
