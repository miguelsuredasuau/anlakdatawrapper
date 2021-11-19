#!/bin/sh

if [ "$DW_DEV_MODE" ] ; then
	echo "Starting crons and watching files for changes..."
	exec nodemon "$@" --watch /datawrapper/code/services/crons --watch /datawrapper/code/plugins --watch /etc/datawrapper/config.js
else
	echo "Starting crons"
	exec node "$@"
fi
