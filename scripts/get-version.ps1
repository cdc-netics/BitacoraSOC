$ErrorActionPreference = 'Stop'
$version = (git describe --tags --always --dirty 2>$null)
if (-not $version) {
  $version = 'dev'
}
Write-Output $version
