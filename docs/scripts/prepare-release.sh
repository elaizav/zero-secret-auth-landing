#!/usr/bin/env sh
set -eu

npm ci
npm run check
npm run build
npm run docs:archive

echo "Release preparation complete. Review dist/ and artifacts/ before deployment."
