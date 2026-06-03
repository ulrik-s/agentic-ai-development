# Repo guide for agents

This repository contains two things:

1. **The presentation** — `index.html`, `theme.css`, served from GitHub Pages
   at <https://ulrik-s.github.io/agentic-ai-development/>. Slides only. Don't
   add a build step.
2. **The live demo project** — `demo/sensor-dashboard/`. A tiny Express app
   that's intentionally incomplete so agents can finish it on stage.

When you're invoked on an **issue or PR**, you are almost certainly working
on the demo project. Read `demo/sensor-dashboard/README.md` and the relevant
file under `demo/issues/` first.

## Demo project conventions

- **Stack:** Node + Express on the backend, vanilla HTML/CSS/JS + Chart.js
  (CDN) on the frontend. No bundler, no framework, no TypeScript.
- **Data:** `demo/sensor-dashboard/data/readings.json`. Regenerate with
  `npm run seed`.
- **Run:** `cd demo/sensor-dashboard && npm install && npm start`.
  Server listens on port 3000. `npm start` uses **nodemon** — it restarts
  automatically when you edit `server.js` or files under `public/`.
- **Live reload:** the dashboard polls `/api/version` every 2 s and
  reloads the page whenever any file in `public/` changes or the server
  restarts. Means the audience sees your work appear without anyone
  hitting F5.
- **Tests:** Playwright when issue #5 lands. `npm test` runs them.
- **Style:** Keep code small and readable. Demo code, not production code.
  No comments unless the *why* is non-obvious. One commit per logical
  change.

## Issue workflow

- Each issue under `demo/issues/` has acceptance criteria. Meet them, no
  more. Don't add features for hypothetical futures.
- Verify your work by actually running the server and hitting the
  endpoint / loading the page — type check and tests are not enough.
- **No PRs.** Push your work straight to `main`:
  `git push origin HEAD:main`. If the push is rejected because someone
  landed first, `git pull --rebase origin main`, resolve any conflicts
  yourself, re-verify, and push again until it lands. Never force-push.

## Out of scope

- Do **not** touch the presentation files (`index.html`, `theme.css`,
  `README.md` at the repo root) unless the task is explicitly about the
  presentation.
- Do **not** add a database. The JSON file is fine for the demo.
- Do **not** introduce a build step.
