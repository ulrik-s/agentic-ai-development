// Generates demo/sensor-dashboard/data/readings.json
// Usage:  node data/seed.js  (or: npm run seed)

const fs = require('fs');
const path = require('path');

const SENSORS = [
  { id: 'office-1',  type: 'temperature', unit: '°C',  base: 21.5, swing: 1.5 },
  { id: 'office-2',  type: 'temperature', unit: '°C',  base: 22.0, swing: 1.2 },
  { id: 'office-1',  type: 'humidity',    unit: '%',   base: 42.0, swing: 5.0 },
  { id: 'office-2',  type: 'humidity',    unit: '%',   base: 40.0, swing: 6.0 },
  { id: 'lobby',     type: 'temperature', unit: '°C',  base: 20.0, swing: 2.0 },
  { id: 'lobby',     type: 'humidity',    unit: '%',   base: 38.0, swing: 4.0 },
];

const HOURS = 48;
const STEP_MIN = 10;
const STEPS = Math.floor((HOURS * 60) / STEP_MIN);
const NOW = Date.now();

const readings = [];
for (let s = 0; s < SENSORS.length; s++) {
  const sensor = SENSORS[s];
  for (let i = 0; i < STEPS; i++) {
    const ts = NOW - (STEPS - i) * STEP_MIN * 60 * 1000;
    const wave = Math.sin((i / STEPS) * Math.PI * 6);
    const noise = (Math.random() - 0.5) * 0.4;
    const value = +(sensor.base + wave * sensor.swing + noise * sensor.swing).toFixed(2);
    readings.push({
      ts: new Date(ts).toISOString(),
      sensor_id: sensor.id,
      type: sensor.type,
      unit: sensor.unit,
      value,
    });
  }
}

readings.sort((a, b) => a.ts.localeCompare(b.ts));

const outFile = path.join(__dirname, 'readings.json');
fs.writeFileSync(outFile, JSON.stringify(readings, null, 2));
console.log(`Wrote ${readings.length} readings to ${outFile}`);
