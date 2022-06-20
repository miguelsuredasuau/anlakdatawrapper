## How the SQL migrations work

Each core migration is stored as individual file in this folder. Plugins may also define additional migrations in their own `plugins/*/migrations` folders.

The migration file follows a simple structure with an `Up` and `Down` section.

```sql
-- Up
CREATE TABLE `schema` (
    `scope` varchar(100) NOT NULL,
    version INT NULL,
    PRIMARY KEY (`scope`)
) ENGINE=InnoDB;

-- Down
DROP TABLE IF EXISTS `schema`;

```

When running the migrations we are parsing the SQL files for the part stored in the "Up" section. The migration file is prefixed with a schema version number. So the file `migrations/018-logo-setting.sql` would be version `18` for the scope `core`, while `plugins/river/migrations/005-add-num-forks.sql` would be version `5` for the scope `river`.

We're storing the current version per scope in the `schema` relation. After a migration is run, the corresponding version will be updated.

### How and when are these migrations run?

There are two places in our codebase where these migrations are run:

1. The legacy way of running migrations is [`services/php/scripts/sync-db.php`](https://github.com/datawrapper/code/blob/main/services/php/scripts/sync-db.php). This script is run every time the `php` Docker container starts (see [entrypoint](https://github.com/datawrapper/code/blob/01b8551a4508841c4e14a74277f994b93b5769fc/services/php/docker/entrypoint.sh#L27-L28))
2. For situations where we need to sync a DB without using PHP (e.g. in CI workflows) we have ported the above script to Node under [`scripts/sync-db.js`](https://github.com/datawrapper/code/blob/main/scripts/sync-db.js)
