#!/usr/bin/env sh
set -eu
version=$(git describe --tags --always --dirty 2>/dev/null || true)
if [ -z "$version" ]; then
  version="dev"
fi
printf '%s\n' "$version"
