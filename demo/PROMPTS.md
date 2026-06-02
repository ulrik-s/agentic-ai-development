# Demo prompts — copy-paste ready

Everything you paste into Claude Code CLI during the live demo. Open
this file on a second monitor (or print it). The sequence assumes the
sensor-dashboard server is already running with nodemon and the browser
is showing http://localhost:3000.

## 0 · Once, before the demo (5 min)

In your main terminal:

```sh
cd demo/sensor-dashboard
npm install
npm start                    # nodemon + the server
```

Open http://localhost:3000 — you should see the empty-state dashboard.
Leave that terminal running for the whole demo.

## 1 · Spawn three parallel agents (worktrees)

In **three separate terminals**, from the repo root:

```sh
# Terminal A
git worktree add ../wt-readings -b demo/readings-endpoint
cd ../wt-readings && claude

# Terminal B
git worktree add ../wt-tempchart -b demo/temperature-chart
cd ../wt-tempchart && claude

# Terminal C
git worktree add ../wt-tests -b demo/e2e-tests
cd ../wt-tests && claude
```

You now have three independent Claude Code sessions, each with its own
copy of the working tree. They can edit, commit, and push without
stepping on each other.

## 2 · Paste these prompts — one per terminal

### Terminal A — Agent 1 (backend endpoint)

```
Read CLAUDE.md and demo/issues/01-readings-endpoint.md.

Plan the implementation out loud first — endpoint shape, query
parameters, validation, error responses. Wait for my approval before
writing code.

Then implement on this branch, commit with a one-line message, push,
and open a PR against main. Don't touch files outside server.js.

After pushing, run a curl against the new endpoint to prove it works.
```

### Terminal B — Agent 2 (temperature chart)

```
Read CLAUDE.md and demo/issues/02-temperature-chart.md.

This depends on the /api/readings endpoint from issue #1. Check if a PR
for it is open or merged on main. If neither, mock the response shape
described in the issue file so we can build against it.

Plan first — file structure, where the chart goes in index.html, how
auto-refresh hooks in. Wait for my approval before coding.

Implement on this branch, commit, push, open a PR. The auto-reload in
app.js will reload the dashboard automatically — don't add a second
mechanism.
```

### Terminal C — Agent 3 (Playwright e2e)

```
Read CLAUDE.md and demo/issues/05-e2e-tests.md.

Set up Playwright as a dev dependency. Write tests that pass against
the current state of main today — health endpoint, dashboard renders,
no console errors. Tests for endpoints that don't exist yet should be
marked .skip with a TODO referencing the issue.

Plan first. Then implement on this branch and open a PR.
```

## 3 · Fire the GitHub Action (Agent 4)

In your browser, open the repo's issue #4 (alerts) and add this
comment:

```
@claude implement this issue.

Read CLAUDE.md first. Plan the endpoint + UI changes, then implement
on a feature branch and open a PR against main. The auto-reload in
app.js means you don't need to add page-refresh logic — only the alert
list itself.
```

Switch to the Actions tab and let the audience see the workflow start.

## 4 · While the agents work — narrate

Talk for ~2 minutes:

- *"Three CLI agents, one GitHub Action agent. Four parallel branches,
  four agents, none of them know about each other. They only know what's
  in CLAUDE.md and their own issue."*
- *"I'm not writing any code. I'm reading diffs when they come in."*

## 5 · Review one PR with the code-review skill

When the first PR appears, jump into that worktree's terminal and run:

```
/code-review
```

If the PR is on GitHub already, comment on it instead:

```
@claude /code-review this PR. Be specific about real correctness or
security issues — skip style nits.
```

## 6 · Approve, merge, watch the browser reload

Merge the first PR via GitHub UI. In your "main" worktree:

```sh
git pull origin main
```

The dashboard in the browser will detect the change (or the server
restart) and reload itself. The audience sees the feature appear with no
human keystroke on the browser.

## 7 · Course-correct on stage (intentional!)

Pick one PR. Comment on it:

```
The chart line should be 2 pixels wide, not the default. Also use a
softer color palette — pastel, not saturated. Push the fix.
```

Watch the agent fix it. This shows the audience that *redirecting* is
the actual skill — not coding.

## 8 · If something breaks

- **Server crashed** — nodemon will restart it as soon as the agent
  fixes the syntax. If not, in the main terminal: `npm start` again.
- **Agent looping on the same error** — escape (`Ctrl+C` in CLI),
  paste: *"That isn't working. Show me the actual error message, then
  propose three different approaches before trying any of them."*
- **Merge conflict on PR** — in the worktree:
  *"Rebase this branch onto origin/main and resolve any conflicts.
  Don't change behaviour, just resolve."*

## 9 · After the demo, tear down

```sh
# Kill all the claude sessions (Ctrl+C in each terminal)
# Then from the main repo:
git worktree remove ../wt-readings
git worktree remove ../wt-tempchart
git worktree remove ../wt-tests
git branch -D demo/readings-endpoint demo/temperature-chart demo/e2e-tests
```

(Keep the merged branches on `main` — those are the demo's deliverable.)
