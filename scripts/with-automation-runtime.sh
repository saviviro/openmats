#!/bin/sh

set -eu

if [ "$#" -eq 0 ]; then
  echo "Usage: sh scripts/with-automation-runtime.sh <command> [args...]" >&2
  exit 64
fi

if [ -n "${CODEX_RUNTIME_DEPENDENCIES:-}" ]; then
  runtime_dependencies="${CODEX_RUNTIME_DEPENDENCIES}"
elif [ -n "${HOME:-}" ]; then
  runtime_dependencies="${HOME}/.cache/codex-runtimes/codex-primary-runtime/dependencies"
else
  runtime_dependencies=""
fi

runtime_node_bin="${runtime_dependencies:+${runtime_dependencies}/node/bin}"
runtime_override_bin="${runtime_dependencies:+${runtime_dependencies}/bin/override}"
runtime_fallback_bin="${runtime_dependencies:+${runtime_dependencies}/bin/fallback}"

# Scheduled Codex worktrees can expose pnpm without exposing the bundled Node
# executable that pnpm needs. Put the versionless bundled runtime first while
# keeping standard package-manager and operating-system locations available.
PATH="${runtime_node_bin:+${runtime_node_bin}:}${runtime_override_bin:+${runtime_override_bin}:}${runtime_fallback_bin:+${runtime_fallback_bin}:}/opt/homebrew/bin:/usr/local/bin:${PATH:-/usr/bin:/bin:/usr/sbin:/sbin}"
export PATH

if ! command -v node >/dev/null 2>&1; then
  echo "Openmats automation runtime error: Node.js was not found." >&2
  echo "Expected Codex runtime: ${runtime_node_bin}/node" >&2
  exit 127
fi

if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 12) ? 0 : 1)'; then
  echo "Openmats automation runtime error: Node.js 22.12 or newer is required." >&2
  exit 126
fi

if ! command -v "$1" >/dev/null 2>&1; then
  echo "Openmats automation runtime error: command not found: $1" >&2
  exit 127
fi

exec "$@"
