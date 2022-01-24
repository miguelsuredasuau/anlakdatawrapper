#!/bin/sh
set -e

echo "Running composer install for core…"
(
    cd /datawrapper/code/services/php
	composer install
)

echo "Running composer install for plugins…"
(
    cd /datawrapper/code/plugins
	for d in *; do
		if [ -d "$d" ] && [ -f "$d/composer.json" ]; then
			echo "Entering $d."
            (
                cd "$d"
				composer install
            )
		fi
	done
)

echo "Waiting for DB…"
php /datawrapper/code/services/php/scripts/check-db.php

echo "Executing database migrations…"
php /datawrapper/code/services/php/scripts/sync-db.php

echo "Removing plugin symlinks in templates…"
rm -f /datawrapper/code/services/php/templates/plugins/*

echo "Installing plugins…"
php /datawrapper/code/services/php/scripts/plugin.php install "*"

echo "Removing dangling plugins from db…"
php /datawrapper/code/services/php/scripts/plugin.php remove-orphans

php-fpm -tt

exec "$@"
