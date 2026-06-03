#!/usr/bin/env bash
# demo/reset.sh — bring the demo back to the clean starting state.
#
# The demo's own setup agent runs this as step 1, so every run starts by
# wiping whatever the previous run left behind: server process, autopull
# loop, worktrees, local + remote branches, open PRs, and commits on main.
#
# Idempotent. Safe to run when there's nothing to clean. Safe to run from
# inside an agent worktree (it never removes the worktree it runs from).
# Requires `gh` (authed) for the GitHub cleanup. Local cleanup runs
# without it.
set -eu

# Resolve the MAIN checkout even when invoked from inside a worktree —
# `--show-toplevel` would give the worktree root, not the repo.
MAIN_WT="$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')"
SELF_WT="$(git rev-parse --show-toplevel)"

# Branches any past or present agent flavour has created.
BRANCH_RE='^(demo/|issue-|claude/|worktree-)'

c()  { printf "\033[1;36m%s\033[0m\n" "$*"; }
ok() { printf "\033[1;32m%s\033[0m\n" "$*"; }
w()  { printf "\033[1;33m%s\033[0m\n" "$*"; }

g() { git -C "$MAIN_WT" "$@"; }

# 1. Kill leftover processes: dev server on :3000 and the autopull loop
c "→ killing dev server (port 3000) and autopull loop"
if command -v lsof >/dev/null 2>&1; then
  lsof -ti:3000 2>/dev/null | xargs -r kill -9 2>/dev/null || true
elif command -v fuser >/dev/null 2>&1; then
  fuser -k 3000/tcp 2>/dev/null || true
fi
pkill -f 'demo/autopull.sh' 2>/dev/null || true
ok "  processes clean"

# 2. Remove ALL worktrees except the main checkout and the one we run from
c "→ removing leftover worktrees"
g worktree list --porcelain \
  | awk '/^worktree / {print $2}' \
  | while read -r wt; do
      [ "$wt" = "$MAIN_WT" ] && continue
      [ "$wt" = "$SELF_WT" ] && continue
      g worktree remove --force "$wt" 2>/dev/null \
        && echo "    removed $wt"
    done || true
g worktree prune
ok "  worktrees clean"

# 3. Delete local leftover branches (checked-out ones are skipped by git)
c "→ deleting local leftover branches"
g branch --format='%(refname:short)' \
  | grep -E "$BRANCH_RE" \
  | while read -r b; do
      g branch -D "$b" 2>/dev/null && echo "    deleted local $b"
    done || true
ok "  local branches clean"

# 4–6. GitHub side: close PRs, delete remote branches, reset main
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  c "→ closing leftover open PRs"
  gh pr list --state open --json number,headRefName \
    --jq '.[] | select(.headRefName | test("'"$BRANCH_RE"'")) | .number' \
    | while read -r n; do
        gh pr close "$n" --delete-branch >/dev/null 2>&1 \
          && echo "    closed PR #$n (branch deleted)"
      done || true

  c "→ deleting remaining remote leftover branches"
  gh api 'repos/{owner}/{repo}/branches' --paginate --jq '.[].name' \
    | grep -E "$BRANCH_RE" \
    | while read -r b; do
        gh api -X DELETE "repos/{owner}/{repo}/git/refs/heads/$b" \
          --silent 2>/dev/null \
          && echo "    deleted remote $b"
      done || true

  g fetch --tags --prune origin >/dev/null 2>&1 || true
  if g rev-parse --verify 'refs/tags/demo-clean' >/dev/null 2>&1; then
    c "→ resetting main to demo-clean"
    g checkout main >/dev/null 2>&1 || true
    g reset --hard demo-clean
    g push --force-with-lease origin main
    ok "  main is at demo-clean"
  else
    w "  tag demo-clean not found — skipping main reset"
    w "  create it once with:"
    w "    git tag -f demo-clean main && git push -f origin demo-clean"
  fi
else
  w "→ gh CLI not authed; skipping GitHub-side cleanup"
  w "  install/auth: brew install gh && gh auth login"
fi

ok "✓ demo ready for another run"
