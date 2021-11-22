#!/bin/sh

if [ "$DW_DEV_MODE" ] ; then
	echo "Starting API and watching files for changes..."
	exec nodemon --inspect=0.0.0.0:9229 "$@" --config nodemon.json
else
	echo "Starting API"
	exec node "$@"
fi
