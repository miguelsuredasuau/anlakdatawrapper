#!/bin/bash

set -euo pipefail

for f in plugins/*/api.{js,cjs}; do
    pushd "$(dirname "$f")" > /dev/null
    if grep -q test:api package.json; then
        npm run test:api -- "$@"
    fi
    popd > /dev/null
done
