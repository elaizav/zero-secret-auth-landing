#!/usr/bin/env sh
set -eu

echo "Checking local development prerequisites..."
node --version
npm --version
python3 --version

echo "Installing project dependencies with npm ci..."
npm ci

echo "Development environment is ready. Recommended next step: npm run check"
