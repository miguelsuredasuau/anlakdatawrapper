#!/bin/sh

if [ "$DW_DEV_MODE" ] ; then
	echo "Starting frontend and watching files for changes... "
	exec nodemon --inspect=0.0.0.0:9229 "$@" --config nodemon.json
else
	echo "Starting frontend"
	exec node "$@"
fi
