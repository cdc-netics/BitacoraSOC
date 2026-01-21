$ErrorActionPreference = 'Stop'
$version = & "$PSScriptRoot\get-version.ps1"
$env:APP_VERSION = $version
Write-Host "APP_VERSION=$version"
docker compose up -d --build
