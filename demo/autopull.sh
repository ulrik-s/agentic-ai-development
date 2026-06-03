#!/usr/bin/env bash
# demo/autopull.sh — keep the main checkout tracking origin/main.
#
# Agents push straight to main from their worktrees; without this loop the
# checkout running nodemon never sees their work and localhost:3000 stays
# frozen. Pull → nodemon restarts → browser auto-reloads. reset.sh kills it.
set -u

MAIN_WT="$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')"
cd "$MAIN_WT"

echo "autopull: syncing $MAIN_WT with origin/main every 3 s"
while true; do
  git pull --ff-only --quiet origin main 2>/dev/null || true
  sleep 3
done
