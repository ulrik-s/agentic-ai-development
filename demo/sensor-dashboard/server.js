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

// GET /api/readings — return readings from data/readings.json.
// Filters: ?sensor=<id>&type=<temperature|humidity>&from=<iso>&to=<iso>&limit=<n>
app.get('/api/readings', (req, res) => {
  const { sensor, type, from, to } = req.query;

  let limit = 500;
  if (req.query.limit !== undefined) {
    limit = Number(req.query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 5000) {
      return res.status(400).json({
        error: 'limit must be an integer between 1 and 5000',
      });
    }
  }

  let readings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  if (sensor) readings = readings.filter((r) => r.sensor_id === sensor);
  if (type) readings = readings.filter((r) => r.type === type);
  if (from) readings = readings.filter((r) => r.ts >= from);
  if (to) readings = readings.filter((r) => r.ts <= to);

  readings.sort((a, b) => a.ts.localeCompare(b.ts));
  readings = readings.slice(-limit);

  res.json({ count: readings.length, readings });
});

// Issue #4: threshold alert rules. Kept in memory — no persistence for the demo.
const alertRules = [];
let nextAlertId = 1;

function latestReading(sensorId, type) {
  const readings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  let latest = null;
  for (const r of readings) {
    if (r.sensor_id !== sensorId || r.type !== type) continue;
    if (!latest || r.ts > latest.ts) latest = r;
  }
  return latest;
}

app.post('/api/alerts', (req, res) => {
  const { sensor_id, type, op, threshold } = req.body || {};
  if (!sensor_id || !type || (op !== '>' && op !== '<') || typeof threshold !== 'number') {
    return res.status(400).json({
      error: 'expected { sensor_id, type, op: ">"|"<", threshold: number }',
    });
  }
  const rule = { id: nextAlertId++, sensor_id, type, op, threshold };
  alertRules.push(rule);
  res.status(201).json(rule);
});

app.get('/api/alerts', (req, res) => {
  const alerts = alertRules.map((rule) => {
    const reading = latestReading(rule.sensor_id, rule.type);
    const value = reading ? reading.value : null;
    const triggered = value !== null
      && (rule.op === '>' ? value > rule.threshold : value < rule.threshold);
    return { ...rule, value, triggered };
  });
  res.json(alerts);
});

app.listen(PORT, () => {
  const count = fs.existsSync(DATA_FILE)
    ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')).length
    : 0;
  console.log(`Sensor dashboard listening on http://localhost:${PORT}`);
  console.log(`Loaded ${count} readings from data/readings.json`);
});
