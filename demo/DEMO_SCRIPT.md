# Live demo — director's notes

The goal: show the audience **the developer is not coding**. Multiple agents
are working in parallel; you are reviewing, redirecting, and merging.

## Once, before the talk

1. **Generate an OAuth token** for the GitHub Action:
   ```sh
   claude setup-token
   ```
   Copy the token.
2. In GitHub → repo Settings → Secrets → Actions, add a secret named
   `CLAUDE_CODE_OAUTH_TOKEN` with that value.
3. **Install the Anthropic GitHub App** on this repo (one-time per org).
   <https://github.com/apps/claude>
4. **Create the 5 issues in GitHub** from the files under `demo/issues/`.
   Title each `#N <short title>`, paste the file content as the body.
   Issues 2 and 3 depend on 1 — note that in their bodies.
5. **Smoke test** locally:
   ```sh
   cd demo/sensor-dashboard && npm install && npm start
   ```
   Confirm <http://localhost:3000> loads with the empty-state message and
   `/api/health` returns OK.

## The stage choreography (about 8 minutes inside Part 3)

Have these tabs open before you start:

| Tab | URL | What it shows |
|---|---|---|
| 1 | `claude.ai/code` — new session | About to start work on issue #1 |
| 2 | `claude.ai/code` — new session | About to start work on issue #2 |
| 3 | `claude.ai/code` — new session | About to start work on issue #5 |
| 4 | GitHub repo, issues list | The 5 issues, all open |
| 5 | GitHub repo, Actions tab | Shows the Claude workflow ready |
| 6 | `localhost:3000` | The empty dashboard |

**Beat 1 — kick off three agents in parallel (~90 s)**

In tabs 1, 2, 3 paste this prompt into each (adjust the issue number):

> Read `CLAUDE.md` and `demo/issues/01-readings-endpoint.md`. Plan first,
> then implement on a feature branch, open a PR. Don't touch unrelated files.

Hit enter in all three. Talk while they work:
- "Three agents, three issues, isolated worktrees. They will not step on
  each other."
- "I'm not going to read a single line of their code yet."

**Beat 2 — fire the GitHub App on issue #4 (~60 s)**

Switch to tab 4. Open issue #4. Add a comment:

> @claude implement this. Read CLAUDE.md first. Open a PR against main.

Switch to tab 5. Watch the workflow start. Say:
- "Same Claude, different surface. This one runs entirely inside GitHub
  Actions. No machine on my end."

**Beat 3 — review what came back (~3 min)**

Switch back to tabs 1–3. By now at least one should have opened a PR. On
that PR comment:

> /code-review ultra

Show the AI review running. While it runs, switch to the next PR and
approve or request a small change *with words*: "the chart line should be
2px not 1px, redo".

Say:
- "This is what my job looks like now. I read. I redirect. I approve."

**Beat 4 — merge and demo the running app (~90 s)**

Merge two PRs. Switch to tab 6, refresh. The dashboard should now show
chart(s). Say:
- "Thirty minutes ago, this was an empty page. I have not written a line
  of code today."

**Beat 5 — kick a CI fix (~60 s)**

If any PR has a failing test, comment on it:

> @claude tests are failing on Node 20 — fix.

End the demo there. Move into the code review section of the talk.

## If things go wrong

- **An agent goes off-track:** stop it, paste a one-line course correction,
  continue. Audiences *love* this — it shows the human is still in charge.
- **The GitHub Action fails to trigger:** check the `@claude` mention is
  literally in the comment, and that the OAuth secret is set. Fall back to
  one of the web sessions to do the same work.
- **Localhost doesn't update:** hard refresh, or restart the server. If a
  PR introduced a syntax error, comment on the PR with `@claude this is
  broken — fix the error` and let it heal itself on stage.

## What to point at when explaining

- **Parallelism:** three sessions, three branches, no merge conflicts —
  because each agent stayed in its lane (as instructed by `CLAUDE.md`).
- **Surface fluidity:** same model, web + GitHub Action + IDE.
- **Cost discipline:** none of this uses an API key. Everything bills
  against the Premium seat — predictable, capped.
