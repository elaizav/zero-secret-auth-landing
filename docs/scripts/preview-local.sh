#!/usr/bin/env sh
set -eu

PORT="${1:-8080}"
ROOT="${2:-.}"

cd "$ROOT"
python3 -m http.server "$PORT"
