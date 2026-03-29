#!/usr/bin/env sh
set -eu

TARGET_PATH="${1:?Provide target path}"
BACKUP_ROOT="${2:-artifacts/deploy-backups}"

if [ ! -d "dist" ]; then
  echo "dist directory was not found. Run npm run build first." >&2
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="$BACKUP_ROOT/$TIMESTAMP"

if [ -d "$TARGET_PATH" ]; then
  mkdir -p "$BACKUP_PATH"
  cp -R "$TARGET_PATH"/. "$BACKUP_PATH"/
fi

mkdir -p "$TARGET_PATH"
cp -R dist/. "$TARGET_PATH"/

echo "Static site updated. Previous version backup: $BACKUP_PATH"
