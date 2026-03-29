param(
  [Parameter(Mandatory = $true)]
  [string]$TargetPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path "dist")) {
  throw "dist directory was not found. Run npm run build first."
}

New-Item -ItemType Directory -Force -Path $TargetPath | Out-Null
Copy-Item "dist\*" -Destination $TargetPath -Recurse -Force

Write-Host "Static output copied to $TargetPath"
