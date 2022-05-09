#!/bin/sh

echo "Starting frontend"
exec node --max-old-space-size=4096 "$@"
