param(
  [int]$Port = 8080,
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"
Set-Location $Root
python -m http.server $Port
