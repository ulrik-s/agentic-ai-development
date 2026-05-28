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
