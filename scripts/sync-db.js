#! /usr/bin/env node
/* eslint no-console: "off" */
const { white, green, yellow, red } = require('chalk');
const ORM = require('@datawrapper/orm');
const glob = require('fast-glob');
const path = require('path');
const groupBy = require('lodash/groupBy');
const set = require('lodash/set');
const { readFile } = require('fs/promises');

const rootDir = path.join(__dirname, '..');

require('dotenv').config({
    path: path.resolve(rootDir, 'utils/docker/.datawrapper_env')
});

const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const config = requireConfig();


set(config, 'orm.skipTableTest', true);

ORM.init(config).then(async () => {
    // add missing tables without touching existing ones
    const { Schema } = require('@datawrapper/orm/models');
    const addedModels = new Map();

    try {
        // apply core migrations
        await applyMigrations('core', await glob(path.join(rootDir, 'migrations/*.sql')));

        // apply plugin migrations
        const pluginMigrations = groupBy(
            await glob(path.join(rootDir, 'plugins/**/migrations/*.sql')),
            f => path.dirname(path.dirname(path.relative(path.join(rootDir, 'plugins'), f)))
        );

        for (const [scope, migrations] of Object.entries(pluginMigrations)) {
            await applyMigrations(scope, migrations);
        }

        console.log(green('Database sync complete.\n'));
    } catch (error) {
        console.error(error);
    } finally {
        ORM.db.close();
    }

    async function applyMigrations(scope, migrations) {
        const version = await getSchemaVersion(scope);
        for (const file of migrations) {
            const migration = await readMigration(file);
            if (migration.version > version) {
                // migrate
                console.log(
                    `migrating ${white(scope)} to schema version ${yellow(
                        migration.version
                    )} (${white(migrations.key)})`
                );
                for (const query of migration.up) {
                    // console.log({ query });
                    try {
                        await ORM.db.query(query);
                    } catch (err) {
                        console.error(red(query));
                    }
                }
                await setSchemaVersion(scope, migration.version);
            }
            if (!addedModels.has(scope)) addedModels.set(scope, new Set());
            migration.adds.forEach(model => addedModels.get(scope).add(model));
        }
    }

    async function getSchemaVersion(scope) {
        try {
            const { version } = await Schema.findByPk(scope);
            return version;
        } catch (error) {
            return 0;
        }
    }

    async function setSchemaVersion(scope, version) {
        if (!addedModels.get('core') || !addedModels.get('core').has('schema')) {
            // we can't set schema version since we don't have a schema table yet
            return;
        }
        try {
            const row = await Schema.findByPk(scope);
            if (row) {
                await row.update({ version });
            } else {
                await Schema.create({ scope, version });
            }
        } catch (error) {
            console.error(error);
        }
    }
});

async function readMigration(file) {
    const sql = await readFile(file, 'utf-8');
    let up = [];
    let down = [];
    let adds = [];
    let mode = '';
    for (const line of sql.split('\n')) {
        if (line.startsWith('--')) {
            if (line.substr(2).trim().toLowerCase() === 'up') {
                mode = 'up';
            } else if (line.substr(2).trim().toLowerCase() === 'down') {
                mode = 'down';
            } else if (line.substr(2).trim().toLowerCase().startsWith('adds ')) {
                mode = '';
                adds = line
                    .substr(7)
                    .trim()
                    .toLowerCase()
                    .split(',')
                    .map(s => s.trim());
            }
        } else {
            if (mode === 'up') up.push(line);
            if (mode === 'down') down.push(line);
        }
    }
    return {
        version: +path.basename(file).split('-')[0],
        key: path.basename(file).replace('.sql', '').split('-').slice(1).join(' '),
        adds,
        up: splitQueries(up.join('\n')),
        down: splitQueries(down.join('\n'))
    };
}

function splitQueries(sql) {
    return sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}