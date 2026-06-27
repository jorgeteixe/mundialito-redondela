#!/usr/bin/env bash
# Catch "module not found" deploy failures BEFORE pushing — without docker.
#
# Why this exists: the Remotion compositions are shipped to the image as raw
# source (additionalFiles) and re-bundled by webpack at runtime. Their imports
# are invisible to esbuild, so any package they need that isn't installed in the
# image fails only at run time, in production. Locally the pnpm workspace hoists
# every package, so a normal `bundle()` always succeeds and hides the problem.
#
# This reproduces the image faithfully: `trigger deploy --dry-run` emits the
# exact deployed package.json + shipped source; we `npm i` that pruned set into
# a clean node_modules (exactly what the Containerfile does) and run the runtime
# bundle there. If a dep is missing from the deploy graph, it fails here too.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> trigger deploy --dry-run (build + collect deploy deps)"
dry_output=$(pnpm exec trigger deploy --dry-run --skip-update-check 2>&1)
echo "$dry_output"

build_dir=$(echo "$dry_output" | grep -oE '/[^[:space:]]+/\.trigger/tmp/build-[A-Za-z0-9]+' | tail -1)
if [[ -z "${build_dir:-}" || ! -d "$build_dir" ]]; then
  echo "ERROR: could not locate dry-run build dir" >&2
  exit 1
fi
echo "==> Build dir: $build_dir"

cp scripts/verify-remotion-bundle.mjs "$build_dir/"

echo "==> Installing ONLY the deployed deps into a clean node_modules (mirrors the image)"
(cd "$build_dir" && npm i --no-audit --no-fund --no-save --no-package-lock >/dev/null 2>&1)

echo "==> Running the runtime Remotion bundle against the image-equivalent node_modules"
(cd "$build_dir" && node verify-remotion-bundle.mjs)

echo "==> OK: deploy bundle resolves cleanly. Safe to push."
