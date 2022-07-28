const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Inert = require('@hapi/inert');
const ORM = require('@datawrapper/orm');
const fs = require('fs-extra');
const Pug = require('pug');
const Redis = require('ioredis');
const {
    validateAPI,
    validateORM,
    validateFrontend,
    validateRedis,
    validatePlugins
} = require('@datawrapper/schemas/config');
const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const registerVisualizations = require('@datawrapper/service-utils/registerVisualizations');
const registerFeatureFlag = require('@datawrapper/service-utils/registerFeatureFlag');
const getGitRevision = require('@datawrapper/service-utils/getGitRevision');
const initGCTrap = require('@datawrapper/service-utils/gcTrap.js');
const config = requireConfig();
const path = require('path');
const { FrontendEventEmitter, eventList } = require('./utils/events');

initGCTrap();

const {
    addScope,
    translate,
    getTranslate,
    getUserLanguage
} = require('@datawrapper/service-utils/l10n');

const DW_DEV_MODE = !!JSON.parse(process.env.DW_DEV_MODE || 'false');

/**
 * Instantiate a Hapi Server instance and configure it.
 */
async function create({ usePlugins = true } = {}) {
    validateAPI(config.api);
    validateORM(config.orm);
    validateFrontend(config.frontend);
    validatePlugins(config.plugins);

    let redis;
    if (config.redis) {
        try {
            validateRedis(config.redis);
            redis = new Redis(config.redis);
        } catch (error) {
            console.warn('[Cache] Invalid Redis configuration, falling back to in memory cache.');
        }
    }

    const server = Hapi.Server({
        port: process.env.PORT || 3000,
        host: 'localhost',
        address: '0.0.0.0',
        tls: false,
        cache: {
            provider: redis
                ? {
                      constructor: require('@hapi/catbox-redis'),
                      options: {
                          client: redis,
                          partition: 'api'
                      }
                  }
                : {
                      constructor: require('@hapi/catbox-memory'),
                      options: {
                          maxByteSize: 52480000
                      }
                  }
        },
        router: { stripTrailingSlash: true }
    });

    if (DW_DEV_MODE) {
        await server.register({
            plugin: require('hapi-dev-errors'),
            options: {
                showErrors: true
            }
        });
    }

    await ORM.init(config);
    await ORM.registerPlugins(server.logger);
    await server.register(Vision);
    await server.register(Inert);

    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: true,
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
            logEvents: ['request', 'log', 'onPostStart', 'onPostStop', 'request-error'],
            level: getLogLevel(),
            base: { name: process.env.COMMIT || require('../package.json').version },
            redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]']
        }
    });

    // load translations
    try {
        const localePath = path.join(__dirname, '../locale');
        const localeFiles = await fs.readdir(localePath);
        const locales = {};
        for (let i = 0; i < localeFiles.length; i++) {
            const file = localeFiles[i];
            if (/[a-z]+_[a-z]+\.json/i.test(file)) {
                locales[file.split('.')[0]] = JSON.parse(
                    await fs.readFile(path.join(localePath, file))
                );
            }
        }
        addScope('core', locales);
    } catch (e) {
        // do nothing
    }

    server.method('config', key => (key ? config[key] : config));
    server.method('isDevMode', () => DW_DEV_MODE);

    server.method('logAction', require('@datawrapper/orm/utils/action').logAction);
    server.method('registerVisualization', registerVisualizations(server));
    server.method('registerFeatureFlag', registerFeatureFlag(server));
    server.method('getRedis', () => redis);

    await server.register(require('@datawrapper/service-utils/computeFileHash'));

    await server.register(require('./utils/api'));
    await server.register(require('./utils/header-links'));
    await server.register(require('./utils/settings-pages'));
    await server.register(require('./utils/demo-datasets'));
    await server.register(require('./utils/chart-actions'));
    await server.register(require('./utils/custom-data'));
    await server.register(require('./utils/custom-html'));

    // hooks
    server.app.event = eventList;
    server.app.events = new FrontendEventEmitter({ logger: server.logger, eventList });

    server.app.GITHEAD = await getGitRevision();

    await server.register(require('./utils/svelte-view/index'));

    server.views({
        engines: {
            pug: Pug,
            svelte: server.app.SvelteView
        },
        relativeTo: __dirname,
        compileOptions: {
            basedir: path.join(__dirname, 'views')
        },
        path: 'views',
        context: server.app.SvelteView.context,
        isCached: !DW_DEV_MODE
    });

    server.method('getUserLanguage', getUserLanguage);
    server.method('translate', translate);
    server.method('getTranslate', getTranslate);
    server.method('getDB', () => ORM.db);
    server.method('getModel', name => ORM.db.models[name]);

    await server.register({
        plugin: require('./utils/sentry'),
        options: { commit: server.app.GITHEAD }
    });
    await server.register(require('./utils/dw-auth'));
    await server.register(require('./utils/features'));

    await server.methods.waitForAPI();

    await server.register([require('./routes')]);

    if (usePlugins) {
        server.logger.info('loading plugins...');
        await server.register([require('./utils/plugin-loader')]);
    }

    // custom HTML error pages
    server.ext('onPreResponse', (request, h) => {
        if (request.response.isBoom) {
            const err = request.response;
            if (err.output.statusCode === 401) {
                return h.redirect(`/signin?ref=${request.path}`).temporary();
            }
            return h
                .view('Error.svelte', {
                    htmlClass: 'has-background-white-bis',
                    props: { ...err.output.payload, data: err.data }
                })
                .code(err.output.payload.statusCode);
        }
        return h.continue;
    });

    /*
     * disable browser cache to prevent loading of an outdated
     * state after using the back/forward browser navigation
     */
    server.ext('onPreResponse', (request, h) => {
        if (!request.route.path.startsWith('/lib/')) {
            request.response.header('Cache-Control', 'no-store');
        }
        return h.continue;
    });

    return server;
}

/**
 * Start passed Hapi Server instance and handle process signals.
 */
async function start(server) {
    server.start();

    setTimeout(() => {
        if (process.send) {
            server.logger.info('sending READY signal to pm2');
            process.send('ready');
        }
    }, 100);

    process.on('SIGINT', async function () {
        server.logger.info('received SIGINT signal, closing all connections...');
        await server.stop();
        server.logger.info('server has stopped');
        process.exit(0);
    });
}

function getLogLevel() {
    if (DW_DEV_MODE) {
        return 'debug';
    }
    if (process.env.NODE_ENV === 'test') {
        return 'error';
    }
    return 'info';
}

module.exports = {
    create,
    start
};
