const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { validateRedis } = require('@datawrapper/schemas/config');
const Catbox = require('@hapi/catbox');
const CatboxRedis = require('@hapi/catbox-redis');
const CatboxMemory = require('@hapi/catbox-memory');
const ORM = require('@datawrapper/orm');
const Redis = require('ioredis');

// initialize database
const config = require('./config');

module.exports = async function () {
    const logger = require('./logger');

    await ORM.init(config);
    await ORM.registerPlugins(logger);

    // register api plugins with core db
    require('@datawrapper/orm/models/Plugin').register(
        'datawrapper-api',
        Object.keys(config.plugins)
    );

    let redis;
    if (config.redis) {
        try {
            validateRedis(config.redis);
            redis = new Redis(config.redis);
        } catch (error) {
            console.warn('[Cache] Invalid Redis configuration, falling back to in memory cache.');
        }
    }

    let cacheConnection = null;
    if (redis) {
        cacheConnection = new Catbox.Client(CatboxRedis, {
            client: redis,
            partition: 'api'
        });
    } else {
        cacheConnection = new Catbox.Client(CatboxMemory, {
            maxByteSize: 52480000
        });
    }

    await cacheConnection.start();

    logger.info('Initializing crons...');

    //
    // JUST ADD THE CRONS BELOW
    //

    // queue export jobs for recently edited charts every minute
    cron.schedule('* * * * *', require('./tasks/queue-editor-screenshots'));

    // invalidate cloudflare cache for recently created chart screenshots
    cron.schedule('* * * * *', require('./tasks/invalidate-screenshot-cache'));

    // collect some stats about charts
    const chartStats = require('./tasks/chart-stats');
    cron.schedule('* * * * *', chartStats.minutely);
    cron.schedule('0 * * * *', chartStats.hourly);
    cron.schedule('0 0 * * *', chartStats.daily);
    cron.schedule('0 0 * * 0', chartStats.weekly);
    cron.schedule('0 0 1 * *', chartStats.monthly);

    // collect some stats about users and teams
    const userTeamStats = require('./tasks/user-team-stats');
    cron.schedule('0 0 * * *', userTeamStats.daily);
    cron.schedule('0 0 * * 0', userTeamStats.weekly);
    cron.schedule('0 0 1 * *', userTeamStats.monthly);

    // collect stats for export-jobs every hour
    const exportJobStats = require('./tasks/export-job-stats');
    cron.schedule('0 0 * * *', exportJobStats.daily);
    cron.schedule('0 * * * *', exportJobStats.hourly);
    cron.schedule('* * * * *', exportJobStats.minutely);

    // collect some stats about api tokens (at 1am)
    const apiTokenStats = require('./tasks/api-token-stats');
    cron.schedule('0 1 * * *', apiTokenStats.daily);
    cron.schedule('0 1 * * 0', apiTokenStats.weekly);
    cron.schedule('0 1 1 * *', apiTokenStats.monthly);

    // remove expired products from users, every 5 minutes
    cron.schedule('*/5 * * * *', require('./tasks/remove-expired-products'));
    // remove expired password reset tokens, every day at 3am
    cron.schedule('0 3 * * *', require('./tasks/remove-expired-pwd-reset-tokens'));
    // remove old export jobs day at 2am
    cron.schedule('0 2 * * *', require('./tasks/remove-old-export-jobs'));
    // remove expired sessions every day at 3:05 am
    cron.schedule('5 3 * * *', require('./tasks/remove-expired-sessions'));
    cron.schedule('5 3 * * *', require('./tasks/remove-admin-sessions'));

    // hourly remove login tokens older than 1h
    cron.schedule('0 * * * *', require('./tasks/remove-expired-login-tokens'));

    const runTestCleanup = require('./tasks/run-test-cleanup');
    cron.schedule('23 14 * * * *', () => runTestCleanup().catch(logger.error));

    // plugins may define crons as well

    // load plugins
    const pluginRoot =
        config.general.localPluginRoot || config.api.localPluginRoot || process.cwd() + '/plugins';

    Object.keys(config.plugins || [])
        .reduce(getPluginPath, [])
        .forEach(registerPlugin);

    function getPluginPath(plugins, name) {
        // If available, use .cjs file (ES Module plugin):
        const cjsPath = path.join(pluginRoot, name, 'crons.cjs');
        if (fs.existsSync(cjsPath)) {
            plugins.push({ name, pluginPath: cjsPath });
            return plugins;
        }

        // Else, use .js file (legacy plugin):
        const jsPath = path.join(pluginRoot, name, 'crons.js');
        if (fs.existsSync(jsPath)) {
            plugins.push({ name, pluginPath: jsPath });
            return plugins;
        }

        // No plugin file — don't add anything:
        return plugins;
    }

    function registerPlugin({ name, pluginPath }) {
        // load the plugin
        let plugin;
        try {
            plugin = require(pluginPath);
        } catch (e) {
            logger.error(`error while importing cron plugin ${name}: ${e}`);
            return;
        }

        // call the hook
        if (typeof plugin.register === 'function') {
            let pluginConfig = {};
            try {
                // load plugin default config
                pluginConfig = require(`${pluginRoot}/${name}/config`);
            } catch (e) {
                // no default config, do nothing
            }

            // extend default plugin cfg with our custom config
            Object.assign(pluginConfig, config.plugins[name]);

            logger.info(`hooked in plugin ${name}...`);
            plugin.register({
                cron,
                logger,
                db: ORM.db,
                createCache(options, segment) {
                    return new Catbox.Policy(options, cacheConnection, segment);
                },
                redis,
                config: {
                    global: config,
                    plugin: pluginConfig
                }
            });
        }
    }

    logger.info('Crons is up and running...');
};
