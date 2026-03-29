param(
  [string]$Destination = "artifacts\project-backups"
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$stagingPath = Join-Path $Destination "zero-secret-auth-landing-$timestamp"
$archivePath = "$stagingPath.zip"

New-Item -ItemType Directory -Force -Path $stagingPath | Out-Null

$items = @(
  "README.md",
  "docs",
  "dist",
  "reference",
  "artifacts\jsdoc-reference.zip",
  "package.json",
  "package-lock.json",
  "eslint.config.mjs",
  "tsconfig.json",
  "jsdoc.config.json"
)

foreach ($item in $items) {
  if (Test-Path $item) {
    Copy-Item $item -Destination $stagingPath -Recurse -Force
  }
}

if (Test-Path $archivePath) {
  Remove-Item $archivePath -Force
}

Compress-Archive -Path "$stagingPath\*" -DestinationPath $archivePath -Force
Write-Host "Backup archive created: $archivePath"
