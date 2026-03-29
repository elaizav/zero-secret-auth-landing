param(
  [string]$NodeVersionHint = "22 LTS"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking local development prerequisites..."
node --version
npm --version
python --version

Write-Host "Installing project dependencies with npm ci..."
npm ci

Write-Host "Development environment is ready. Recommended next step: npm run check"
