#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERCEL_DIR="$ROOT_DIR/.vercel"

get_vercel_cmd() {
  if command -v vercel >/dev/null 2>&1; then
    printf 'vercel'
    return
  fi

  if command -v npx >/dev/null 2>&1; then
    printf 'npx vercel'
    return
  fi

  echo "Neither vercel nor npx is available." >&2
  exit 1
}

run_vercel() {
  local vercel_cmd="$1"
  shift

  if [[ "$vercel_cmd" == "vercel" ]]; then
    vercel --cwd "$ROOT_DIR" "$@"
    return
  fi

  npx vercel --cwd "$ROOT_DIR" "$@"
}

if [[ ! -d "$VERCEL_DIR" || ! -f "$VERCEL_DIR/project.json" ]]; then
  echo "Vercel project link not found in ${VERCEL_DIR}." >&2
  echo "Run 'vercel link' first." >&2
  exit 1
fi

VERCEL_CMD="$(get_vercel_cmd)"

cd "$ROOT_DIR"
run_vercel "$VERCEL_CMD" env pull .env.local --yes
