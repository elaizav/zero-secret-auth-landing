#!/usr/bin/env sh
set -eu

TARGET_PATH="${1:?Provide target path}"

if [ ! -d "dist" ]; then
  echo "dist directory was not found. Run npm run build first." >&2
  exit 1
fi

mkdir -p "$TARGET_PATH"
cp -R dist/. "$TARGET_PATH/"

echo "Static output copied to $TARGET_PATH"
