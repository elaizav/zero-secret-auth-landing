#!/usr/bin/env sh
set -eu

DESTINATION="${1:-artifacts/project-backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
STAGING_PATH="$DESTINATION/zero-secret-auth-landing-$TIMESTAMP"
ARCHIVE_PATH="$STAGING_PATH.tar.gz"

mkdir -p "$STAGING_PATH"

for item in README.md docs dist reference artifacts/jsdoc-reference.zip package.json package-lock.json eslint.config.mjs tsconfig.json jsdoc.config.json; do
  if [ -e "$item" ]; then
    cp -R "$item" "$STAGING_PATH"/
  fi
done

tar -czf "$ARCHIVE_PATH" -C "$STAGING_PATH" .
echo "Backup archive created: $ARCHIVE_PATH"
