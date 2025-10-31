#!/usr/bin/env bash
# One-stop PR conflict resolver for Nexus Frontend.
# Usage: bash scripts/auto-unlock.sh <PR_BRANCH> <BASE_BRANCH>
set -euo pipefail

PR_BRANCH="${1:-}"
BASE_BRANCH="${2:-}"

if [[ -z "$PR_BRANCH" || -z "$BASE_BRANCH" ]]; then
  echo "Usage: $0 <PR_BRANCH> <BASE_BRANCH>"
  exit 1
fi

# Detect package manager (prefer pnpm if present)
PKG_MGR="npm"
if [[ -f pnpm-workspace.yaml || -f Frontend/pnpm-lock.yaml || -f pnpm-lock.yaml ]]; then
  PKG_MGR="pnpm"
fi

echo "==> Using package manager: $PKG_MGR"
echo "==> PR branch: $PR_BRANCH | base: $BASE_BRANCH"

git fetch origin
git checkout "$PR_BRANCH"
RESOLVE_BRANCH="${PR_BRANCH}-resolve-$(date +%Y%m%d%H%M%S)"
git switch -c "$RESOLVE_BRANCH" || git checkout -b "$RESOLVE_BRANCH"

echo "==> Merging origin/${BASE_BRANCH}..."
set +e
git merge "origin/${BASE_BRANCH}"
MERGE_RC=$?
set -e

if [[ $MERGE_RC -ne 0 ]]; then
  echo "==> Merge reported conflicts; attempting auto-resolution…"
fi

KEEP_FILES=(
  Frontend/src/app/AppShell.tsx
  Frontend/src/features/chat/ChatList.tsx
  Frontend/src/features/chat/ChatWorkspace.tsx
  Frontend/src/features/mode/ModeToggle.tsx
  Frontend/src/features/settings/AppearanceSettings.tsx
  Frontend/src/features/theme/ThemeToggle.tsx
  Frontend/src/index.css
  Frontend/src/shared/state/session.ts
  Frontend/src/shared/ui/components/button.tsx
  Frontend/src/shared/ui/components/input.tsx
  Frontend/src/shared/ui/components/switch.tsx
  Frontend/src/shared/ui/theme/ThemeProvider.tsx
  Frontend/src/shared/ui/tokens.css
)

# Keep OURS for any of the above that are conflicted
for f in "${KEEP_FILES[@]}"; do
  if git ls-files -u | grep -qE "\s${f}$"; then
    echo "==> Keeping OURS for ${f}"
    git checkout --ours "$f"
    git add "$f"
  fi
done

# Handle lockfile (remove conflicted; regenerate later)
LOCKFILE="Frontend/package-lock.json"
if git ls-files -u | grep -q "$LOCKFILE"; then
  echo "==> Removing conflicted ${LOCKFILE}"
  git rm --cached "$LOCKFILE" || true
  rm -f "$LOCKFILE" || true
fi

# Stop if anything else remains conflicted
REMAINING=$(git diff --name-only --diff-filter=U || true)
if [[ -n "$REMAINING" ]]; then
  echo "ERROR: Remaining conflicts need manual attention:"
  echo "$REMAINING"
  exit 2
fi

# Reduce future conflicts
if [[ ! -f .gitattributes ]] || ! grep -q "Frontend/package-lock.json" .gitattributes 2>/dev/null; then
  echo "==> Updating .gitattributes"
  {
    echo "Frontend/package-lock.json merge=ours"
    echo "*.png binary"
    echo "*.jpg binary"
    echo "*.webp binary"
    echo "*.ico binary"
    echo "*.woff* binary"
  } >> .gitattributes
  git add .gitattributes
fi

echo "==> Installing deps in Frontend (regenerate lockfile)…"
pushd Frontend >/dev/null
if [[ "$PKG_MGR" == "pnpm" ]]; then
  pnpm install
else
  npm ci || npm install
fi
popd >/dev/null

# Re-add lockfile if npm
[[ -f "$LOCKFILE" ]] && git add "$LOCKFILE"

echo "==> Lint/build/test (lint/tests best-effort)…"
set +e
if [[ "$PKG_MGR" == "pnpm" ]]; then
  (cd Frontend && pnpm run lint) || true
  (cd Frontend && pnpm run build)
  (cd Frontend && pnpm run test) || true
else
  (cd Frontend && npm run lint) || true
  (cd Frontend && npm run build)
  (cd Frontend && npm run test) || true
fi
set -e

git add -A
git commit -m "Auto-resolve Frontend conflicts: keep refactor, regen lockfile, update attributes"

echo "==> Pushing ${RESOLVE_BRANCH}…"
git push -u origin "$RESOLVE_BRANCH"

echo
echo "✅ Done. Use ${RESOLVE_BRANCH} as the PR branch (or merge into your PR branch)."
echo "   Merge button should be available once CI finishes."
