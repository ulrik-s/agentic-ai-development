# Demo prompts — one prompt, everything happens

Open this on a second monitor for the demo. The whole live-coding demo
is **one terminal, one prompt** — Claude orchestrates the rest.

## 0 · Once, before the demo

Nothing. No worktrees to create, no servers to start. The orchestrator
prompt does everything.

Just have your browser tabs ready:

- <http://localhost:3000> — the dashboard (will be started by the agent)
- <https://github.com/ulrik-s/agentic-ai-development/issues> — the issues

## 1 · The orchestrator prompt

Open a terminal in the repo root and run:

```sh
claude
```

Then paste this single prompt:

```
You are the orchestrator for a live demo. Do these things in parallel.

STEP 1 — Start the dev server in the background.
Run: `cd demo/sensor-dashboard && npm install && npm start` as a
background process. The server uses nodemon, so it restarts when files
change. The dashboard at http://localhost:3000 will auto-reload when
the browser detects a version bump. Do not block waiting for the server;
move on as soon as it's up.

STEP 2 — Spawn three parallel agents using the Task tool with
isolation="worktree". Send them in a single message so they run
concurrently. Do NOT do their work yourself — delegate.

  Agent A · issue #1 backend endpoint
    Read CLAUDE.md and demo/issues/01-readings-endpoint.md.
    Plan, implement, commit, push branch, open a PR against main.
    Do not touch files outside server.js.

  Agent B · issue #2 temperature chart
    Read CLAUDE.md and demo/issues/02-temperature-chart.md.
    The endpoint from issue #1 may not exist yet — if not, mock the
    response shape described in the issue file.
    Plan, implement, commit, push branch, open a PR. Don't add a second
    auto-reload mechanism — public/app.js already polls /api/version.

  Agent C · issue #5 Playwright e2e
    Read CLAUDE.md and demo/issues/05-e2e-tests.md.
    Add Playwright as a dev dependency. Write tests that pass against
    today's main (health, dashboard renders, no console errors).
    Skip tests for endpoints that don't exist yet.
    Plan, implement, commit, push branch, open a PR.

STEP 3 — While agents work, monitor and report.
When each agent finishes, give me a one-line status. Don't wait for
them sequentially — they should all run at once.

STEP 4 — When I say "review them", do this:
For each open PR, run /code-review on it. Post the findings as inline
comments. Tell me which PR you'd merge first.
```

## 2 · While the agents work — narrate

Talk for ~2 minutes:

- *"One prompt. Four agents — three CLI subagents in isolated git
  worktrees, one GitHub-Action agent we'll add in a moment."*
- *"They only know what's in CLAUDE.md and their own issue file. I'm
  not coding anything."*
- *"The dashboard at localhost:3000 will reload itself as features
  land. Nobody is touching that browser."*

## 3 · Fire the GitHub Action (Agent 4)

In GitHub, open issue #4 (alerts) and add this comment:

```
@claude implement this issue.

Read CLAUDE.md first. Plan, then implement on a feature branch and
open a PR against main. Don't add page-refresh logic — public/app.js
already polls /api/version.
```

Switch to the Actions tab so the audience sees the workflow run.

## 4 · Review and merge

When the agents report PRs are open, paste this single message into the
orchestrator session:

```
review them
```

That triggers Step 4 from the original prompt — code-review on every
PR, with a recommended merge order.

Merge the first PR via GitHub UI. The browser at localhost:3000 will
notice the next time nodemon restarts (or when public/ changes) and
reload itself.

## 5 · Course-correct on stage (optional but powerful)

Pick any open PR and comment on it:

```
The chart line should be 2 pixels wide. Use a softer pastel palette,
not saturated. Push the fix.
```

Watch the agent fix it. This is the moment the audience understands:
*directing* is the skill.

## 6 · If something breaks

- **Server died and nodemon didn't catch it** — in the orchestrator
  session: *"the server seems down. Check the background process and
  restart it if needed."*
- **An agent went off-track** — *"agent A is doing the wrong thing.
  Tell it to revert the last edit and re-plan, in three options."*
- **Merge conflict on a PR** — *"PR #N has a conflict. Rebase the
  branch onto main and resolve."*

## 7 · After the demo

Cleanup is handled by the orchestrator — ask it to tear down:

```
We're done. Stop the dev server, delete all worktrees you created, and
delete the local feature branches. Don't delete merged commits or
remote branches — I'll do that myself.
```
