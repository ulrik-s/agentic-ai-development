#!/usr/bin/env bash
# demo/reset.sh — bring the demo back to the clean starting state.
#
# Run this between live-demo rehearsals to wipe everything an agent run
# leaves behind: server process, worktrees, local branches, remote
# branches, open PRs, and merged commits on main.
#
# Idempotent. Safe to run when there's nothing to clean.
# Requires `gh` (authed) for the GitHub cleanup. Local cleanup runs
# without it.
set -eu

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

CLEAN_TAG="demo-clean"
DEMO_BRANCH_RE='^demo/'

c()  { printf "\033[1;36m%s\033[0m\n" "$*"; }
ok() { printf "\033[1;32m%s\033[0m\n" "$*"; }
w()  { printf "\033[1;33m%s\033[0m\n" "$*"; }

# 1. Free port 3000 (kill nodemon / node from a previous run)
c "→ killing anything on port 3000"
if command -v lsof >/dev/null 2>&1; then
  lsof -ti:3000 2>/dev/null | xargs -r kill -9 2>/dev/null || true
elif command -v fuser >/dev/null 2>&1; then
  fuser -k 3000/tcp 2>/dev/null || true
fi
ok "  port 3000 is free"

# 2. Remove worktrees the agents created
c "→ removing demo worktrees"
git worktree list --porcelain 2>/dev/null \
  | awk '/^worktree / {print $2}' \
  | while read -r wt; do
      case "$wt" in
        "$REPO_ROOT") continue ;;
        *)
          # Agent-created worktrees live outside REPO_ROOT and usually
          # carry "wt-", "agent-", or "demo-issue-" in the path.
          case "$(basename "$wt")" in
            wt-*|agent-*|demo-issue-*|demo-*)
              git worktree remove --force "$wt" 2>/dev/null \
                && echo "    removed $wt"
              ;;
          esac
          ;;
      esac
    done
git worktree prune
ok "  worktrees clean"

# 3. Delete local demo/* branches
c "→ deleting local demo/* branches"
git branch --format='%(refname:short)' \
  | grep -E "$DEMO_BRANCH_RE" \
  | while read -r b; do
      git branch -D "$b" 2>/dev/null && echo "    deleted local $b"
    done || true
ok "  local branches clean"

# 4–6. GitHub side: close PRs, delete remote branches, reset main
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  c "→ closing open demo PRs"
  gh pr list --state open --json number,headRefName \
    --jq '.[] | select(.headRefName | test("'"$DEMO_BRANCH_RE"'")) | .number' \
    | while read -r n; do
        gh pr close "$n" --delete-branch >/dev/null 2>&1 \
          && echo "    closed PR #$n (branch deleted)"
      done || true

  c "→ deleting remaining remote demo/* branches"
  gh api 'repos/{owner}/{repo}/branches' --paginate --jq '.[].name' \
    | grep -E "$DEMO_BRANCH_RE" \
    | while read -r b; do
        gh api -X DELETE "repos/{owner}/{repo}/git/refs/heads/$b" \
          --silent 2>/dev/null \
          && echo "    deleted remote $b"
      done || true

  if git rev-parse --verify "$CLEAN_TAG" >/dev/null 2>&1; then
    c "→ resetting main to $CLEAN_TAG"
    git fetch --tags origin >/dev/null 2>&1 || true
    git checkout main >/dev/null 2>&1
    git reset --hard "$CLEAN_TAG"
    git push --force-with-lease origin main
    ok "  main is at $CLEAN_TAG"
  else
    w "  tag $CLEAN_TAG not found — skipping main reset"
    w "  create it once with:"
    w "    git tag $CLEAN_TAG && git push origin $CLEAN_TAG"
  fi
else
  w "→ gh CLI not authed; skipping GitHub-side cleanup"
  w "  install/auth: brew install gh && gh auth login"
fi

ok "✓ demo ready for another run"
