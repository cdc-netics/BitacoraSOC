#!/usr/bin/env sh
set -eu
script_dir="$(dirname "$0")"
version="$(sh "$script_dir/get-version.sh")"
export APP_VERSION="$version"
printf 'APP_VERSION=%s\n' "$APP_VERSION"
docker compose build --no-cache
docker compose up -d --force-recreate
