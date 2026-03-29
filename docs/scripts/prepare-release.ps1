$ErrorActionPreference = "Stop"

npm ci
npm run check
npm run build
npm run docs:archive

Write-Host "Release preparation complete. Review dist/ and artifacts/ before deployment."
