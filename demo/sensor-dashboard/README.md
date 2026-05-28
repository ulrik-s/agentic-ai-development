# Sensor Dashboard (demo)

A minimal sensor-data dashboard skeleton, used as the agentic-development
live demo. Agents fill in the features tracked in `demo/issues/`.

## Stack

- **Backend:** Node + Express. Data lives in `data/readings.json` (no DB).
- **Frontend:** vanilla HTML/CSS/JS + Chart.js via CDN. No build step.

## Run

```sh
cd demo/sensor-dashboard
npm install
npm start
```

Open <http://localhost:3000>. Health check at `/api/health`.

To regenerate the mock dataset:

```sh
npm run seed
```

## Layout

```
demo/sensor-dashboard/
├── server.js          Express app
├── data/
│   ├── seed.js        generator for readings.json
│   └── readings.json  ~1700 mock readings, 6 sensors, 48h history
└── public/            static assets served at /
    ├── index.html
    ├── styles.css
    └── app.js
```

## What's missing (on purpose)

Everything in `demo/issues/`. The agents take it from here.
