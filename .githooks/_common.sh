#!/bin/sh
# Shared setup for the hooks in .githooks/, which git runs directly.
#
# Keeps the guards in one place: run from the repository root, make sure the
# local toolchain is usable, and print the matching escape hatch when a hook
# blocks a commit or a push.

set -e

cd "$(git rev-parse --show-toplevel)"

for tool in node npm; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "'$tool' was not found on PATH, so the hooks cannot run." >&2
    echo "Commit from a terminal, or bypass this run once with '$BYPASS'." >&2
    exit 1
  fi
done

if [ ! -d node_modules ]; then
  echo "Hooks need the project dependencies: run 'npm install' first." >&2
  exit 1
fi

node_major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
if [ "$node_major" -lt 24 ]; then
  echo "Node 24 or newer is required (found $(node -v 2>/dev/null || echo 'no node'))." >&2
  exit 1
fi

# `fail "message"` stops the hook and points at the escape hatch. BYPASS is set
# by each hook to the matching command.
fail() {
  echo "" >&2
  echo "$1" >&2
  echo "Fix the output above and retry, or bypass this run once with '$BYPASS'." >&2
  exit 1
}
