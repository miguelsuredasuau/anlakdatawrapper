const cron = require('node-cron');
const { fetchAllPlugins } = require('@datawrapper/backend-utils');
const { validateRedis } = require('@datawrapper/schemas/config');
const Catbox = require('@hapi/catbox');
const CatboxRedis = require('@hapi/catbox-redis');
const CatboxMemory = require('@hapi/catbox-memory');
const { initORM } = require('@datawrapper/orm');
const { Plugin } = require('@datawrapper/orm/db');
const Redis = require('ioredis');

// initialize database
const config = require('./config');

module.exports = async function () {
    const logger = require('./logger');

    const { db, registerPlugins } = await initORM(config);
    await registerPlugins(logger);

    // register api plugins with core db
    Plugin.register('datawrapper-api', Object.keys(config.plugins));

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
    const pluginsInfo = await fetchAllPlugins(config);

    Object.entries(pluginsInfo).forEach(registerPlugin);

    function registerPlugin([name, { pluginConfig, entryPoints }]) {
        if (!entryPoints.crons) {
            return;
        }

        // load the plugin
        let plugin;
        try {
            plugin = require(entryPoints.crons);
        } catch (e) {
            logger.error(`error while importing cron plugin ${name}: ${e}`);
            return;
        }

        // call the hook
        if (typeof plugin.register === 'function') {
            const pluginDefaultConfig = entryPoints.config ? require(entryPoints.config) : {};

            // extend default plugin cfg with our custom config
            const pluginFinalConfig = Object.assign(pluginDefaultConfig, pluginConfig);

            logger.info(`hooked in plugin ${name}...`);
            plugin.register({
                cron,
                logger,
                db,
                createCache(options, segment) {
                    return new Catbox.Policy(options, cacheConnection, segment);
                },
                redis,
                config: {
                    global: config,
                    plugin: pluginFinalConfig
                }
            });
        } else {
            logger.error(
                `plugin ${name} has crons module but the module does not export 'register'`
            );
        }
    }

    logger.info('Crons is up and running...');
};
