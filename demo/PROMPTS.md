# Demo prompts — a self-cleaning fleet

Open this on a second monitor. The whole live demo runs from **one
`claude agents` fleet view**: you dispatch background agents, they do
everything else — including cleaning up whatever the previous run left
behind, as the very first step.

No PRs anywhere. Every agent pushes straight to `main` and resolves its
own rebase conflicts. The fleet view is the spectacle: parallel
sessions, live status lines, zero hands on the code.

## 0 · Once, before the demo

- `gh auth status` succeeds — the cleanup step needs it
- A browser tab on <http://localhost:3000> — it comes alive when the
  setup agent starts the server

## 1 · Start the fleet view

```sh
claude agents --dangerously-skip-permissions
```

The flag is what makes the demo autonomous: no permission prompt can
stall an agent mid-show. Acceptable here — own repo, own machine, demo
code.

## 2 · Dispatch 1 — setup agent (cleanup happens FIRST)

Dispatch a new session with this prompt:

```
You are the setup agent for a live demo. Work in the repo root — do
NOT create a worktree. In order:

1. Run `bash demo/reset.sh` and show me its output. It wipes
   everything a previous run left behind (server, autopull loop,
   worktrees, branches, PRs) and resets main to the demo-clean tag.
2. Start the dev server in the background:
   `cd demo/sensor-dashboard && npm install && npm start`
3. From the repo root, start `bash demo/autopull.sh` in the
   background. It keeps this checkout synced with origin/main so the
   dashboard updates as agents push.
4. When http://localhost:3000/api/health returns ok, report
   "dashboard live". Leave both processes running.
```

While it runs, narrate: *"Step one of the demo is the demo cleaning up
after the last demo. Nothing here assumes a clean room."*

## 3 · Dispatch 2–5 — four feature agents

Dispatch each of these as its own session, back to back. Don't wait
between them — the point is that they run at once.

**Agent A · issue #1, readings endpoint**

```
Read CLAUDE.md and demo/issues/01-readings-endpoint.md. Work in an
isolated git worktree. Implement the issue, meeting its acceptance
criteria — no more. Verify by running the server in your worktree
(PORT=3101 npm run start:once) and exercising the endpoint with curl.
Commit, then push straight to main: git push origin HEAD:main. If the
push is rejected, git pull --rebase origin main, resolve conflicts
yourself, re-verify, and push again until it lands. Never force-push.
Do not open a PR. Report one line when your work is on main.
```

**Agent B · issue #2, temperature chart**

```
Read CLAUDE.md and demo/issues/02-temperature-chart.md. Work in an
isolated git worktree. The /api/readings endpoint may not be on main
yet — if so, code against the response shape in the issue file; it
will land while you work. Do not add any reload mechanism;
public/app.js already polls /api/version. Verify with the server in
your worktree (PORT=3102 npm run start:once). Commit, then push
straight to main: git push origin HEAD:main. If rejected, git pull
--rebase origin main, resolve conflicts yourself, re-verify, push
again until it lands. Never force-push. Do not open a PR. Report one
line when your work is on main.
```

**Agent C · issue #4, threshold alerts**

```
Read CLAUDE.md and demo/issues/04-alerts.md. Work in an isolated git
worktree. Alert state reads data/readings.json directly, so don't
block on other agents' work. Do not add any reload mechanism. Verify
with the server in your worktree (PORT=3104 npm run start:once).
Commit, then push straight to main: git push origin HEAD:main. If
rejected, git pull --rebase origin main, resolve conflicts yourself,
re-verify, push again until it lands. Never force-push. Do not open a
PR. Report one line when your work is on main.
```

**Agent D · issue #5, Playwright e2e**

```
Read CLAUDE.md and demo/issues/05-e2e-tests.md. Work in an isolated
git worktree. Configure Playwright's webServer on port 3105 so you
never collide with the live dashboard on 3000. Only assert endpoints
that exist on main at the moment you push — rebase first, check, keep
the suite green. Commit, then push straight to main: git push origin
HEAD:main. If rejected, git pull --rebase origin main, resolve
conflicts yourself, re-verify, push again until it lands. Never
force-push. Do not open a PR. Report one line when your work is on
main.
```

Issue #3 (humidity chart) stays in reserve — see step 6.

## 4 · While the fleet works — narrate

- *"Five agents. One cleaned the stage, four are building. I haven't
  opened an editor."*
- *"They all push to main. When two land at once, the loser rebases,
  resolves the conflict itself, and pushes again. Watch the status
  lines."*
- *"The dashboard tab updates itself — pull, nodemon restart, browser
  reload. Nobody touches that browser."*

## 5 · Dispatch 6 — reviewer agent

When the feature agents report done, dispatch:

```
You are the reviewer. The day's work is everything on main since the
demo-clean tag: git diff demo-clean..main. Review it for real
problems — bugs, console errors, violations of CLAUDE.md conventions.
Fix what you find in an isolated worktree, verify, and push fixes
straight to main (rebase and retry if rejected, never force-push, no
PRs). If demo/sensor-dashboard has a test suite now, run npm test and
make it green. Report each finding as one line: file — problem — fix.
```

Narrate: *"Reviewing is also delegated. My job is reading these
one-liners and deciding if I agree."*

## 6 · Course-correct on stage (optional but powerful)

Open Agent B's finished session and send:

```
The chart line should be 2 pixels wide. Use a softer pastel palette,
not saturated. Push the fix to main.
```

Or, if there's time, dispatch a fresh agent on the spare issue:

```
Read CLAUDE.md and demo/issues/03-humidity-chart.md. Same rules as
before: isolated worktree, verify on PORT=3103, push straight to
main, rebase on rejection, no PR.
```

This is the moment the audience understands: *directing* is the skill.

## 7 · If something breaks

- **Dashboard frozen** — message the setup agent: *"Are the server and
  the autopull loop still running? Restart whatever died."*
- **An agent stuck in a rebase loop** — message it: *"Show me the
  conflict. Take both sides where possible, re-verify, push."*
- **An agent went off-track** — *"Stop. Revert your last edit and
  re-plan in three options."*
- **Total meltdown** — run `bash demo/reset.sh` yourself, restart from
  step 2. It's idempotent and takes seconds.

## 8 · After the demo — reset for the next run

```sh
bash demo/reset.sh
```

(or from inside `demo/sensor-dashboard/`: `npm run reset`)

It handles every lingering piece:

1. Kills the dev server (port 3000) and the autopull loop
2. Removes all leftover git worktrees (except the one it runs from)
3. Deletes local `demo/*`, `issue-*`, `claude/*`, `worktree-*` branches
4. Closes any open PRs from those branches (`gh` required)
5. Deletes the matching remote branches
6. Force-resets `main` to the `demo-clean` tag and pushes

Idempotent — safe to run twice, safe to run when nothing's lingering.
It's the same script the setup agent runs at the start of every demo,
so even a skipped reset heals itself next time.

**Whenever the clean baseline changes** (slides, demo docs, this file),
move the tag:

```sh
git tag -f demo-clean main && git push -f origin demo-clean
```
