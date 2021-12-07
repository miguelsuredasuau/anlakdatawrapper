#!/bin/sh

if [ "$DW_DEV_MODE" ] ; then
	echo "Starting crons and watching files for changes..."
	exec nodemon "$@" --config nodemon.json
else
	echo "Starting crons"
	exec node "$@"
fi
