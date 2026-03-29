param(
  [Parameter(Mandatory = $true)]
  [string]$TargetPath,
  [string]$BackupRoot = "artifacts\deploy-backups"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path "dist")) {
  throw "dist directory was not found. Run npm run build first."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $BackupRoot $timestamp

if (Test-Path $TargetPath) {
  New-Item -ItemType Directory -Force -Path $backupPath | Out-Null
  Copy-Item "$TargetPath\*" -Destination $backupPath -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $TargetPath | Out-Null
Copy-Item "dist\*" -Destination $TargetPath -Recurse -Force

Write-Host "Static site updated. Previous version backup: $backupPath"
