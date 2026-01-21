$ErrorActionPreference = 'Stop'
$version = & "$PSScriptRoot\get-version.ps1"
$env:APP_VERSION = $version
Write-Host "APP_VERSION=$version"
docker compose build --no-cache
docker compose up -d --force-recreate
