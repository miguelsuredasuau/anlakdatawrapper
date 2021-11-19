#!/bin/sh

if [ "$DW_DEV_MODE" ] ; then
	echo "Starting API and watching files for changes..."
	exec nodemon --inspect=0.0.0.0:9229 "$@" --watch /datawrapper/code/services/api --watch /datawrapper/code/plugins --watch /etc/datawrapper/config.js
else
	echo "Starting API"
	exec node "$@"
fi
