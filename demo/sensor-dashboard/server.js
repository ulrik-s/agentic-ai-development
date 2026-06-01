const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'readings.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 5000;

app.get('/api/readings', (req, res) => {
  const { sensor, type, from, to } = req.query;

  let limit = DEFAULT_LIMIT;
  if (req.query.limit !== undefined) {
    limit = Number(req.query.limit);
    if (!Number.isInteger(limit) || limit < 1) {
      return res.status(400).json({ error: 'limit must be a positive integer' });
    }
    limit = Math.min(limit, MAX_LIMIT);
  }

  let readings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

  if (sensor) readings = readings.filter((r) => r.sensor_id === sensor);
  if (type) readings = readings.filter((r) => r.type === type);
  if (from) readings = readings.filter((r) => r.ts >= from);
  if (to) readings = readings.filter((r) => r.ts <= to);

  readings.sort((a, b) => a.ts.localeCompare(b.ts));
  if (readings.length > limit) readings = readings.slice(-limit);

  res.json({ count: readings.length, readings });
});

// TODO (issue #4): POST /api/alerts — store a threshold alert rule
// TODO (issue #4): GET  /api/alerts — list active alerts

app.listen(PORT, () => {
  const count = fs.existsSync(DATA_FILE)
    ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')).length
    : 0;
  console.log(`Sensor dashboard listening on http://localhost:${PORT}`);
  console.log(`Loaded ${count} readings from data/readings.json`);
});
