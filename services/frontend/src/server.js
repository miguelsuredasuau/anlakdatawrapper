const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Inert = require('@hapi/inert');
const Pino = require('hapi-pino');
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
const config = requireConfig();
const path = require('path');
const { createAPI, waitForAPI } = require('./utils/create-api');
const { FrontendEventEmitter, eventList } = require('./utils/events');

const {
    addScope,
    translate,
    getTranslate,
    getUserLanguage
} = require('@datawrapper/service-utils/l10n');

const start = async () => {
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

    if (process.env.DW_DEV_MODE) {
        await server.register({
            plugin: require('hapi-dev-errors'),
            options: {
                showErrors: process.env.NODE_ENV !== 'production'
            }
        });
    }

    await ORM.init(config);
    await ORM.registerPlugins(server.logger);
    await server.register(Vision);
    await server.register(Inert);

    await server.register({
        plugin: Pino,
        options: {
            prettyPrint: true,
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
            logEvents: ['request', 'log', 'onPostStart', 'onPostStop', 'request-error'],
            level: process.env.DW_DEV_MODE
                ? 'debug'
                : process.env.NODE_ENV === 'test'
                ? 'error'
                : 'info',
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
    server.method('logAction', require('@datawrapper/orm/utils/action').logAction);
    server.method('isDevMode', () => process.env.DW_DEV_MODE);
    server.method('registerVisualization', registerVisualizations(server));
    server.method('registerFeatureFlag', registerFeatureFlag(server));
    server.method('createAPI', createAPI(server));
    server.method('getRedis', () => redis);

    await server.register(require('./utils/header-links'));
    await server.register(require('./utils/settings-pages'));
    await server.register(require('./utils/demo-datasets'));
    await server.register(require('./utils/chart-actions'));
    await server.register(require('./utils/custom-data'));
    await server.register(require('./utils/custom-html'));

    // hooks
    server.app.event = eventList;
    server.app.events = new FrontendEventEmitter({ logger: server.logger, eventList });

    server.app.GITHEAD = (
        await fs.readFile(path.join(__dirname, '..', '.githead'), 'utf-8')
    ).trim();

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
        isCached: !process.env.DW_DEV_MODE
    });

    server.method('getUserLanguage', getUserLanguage);
    server.method('translate', translate);
    server.method('getTranslate', getTranslate);
    server.method('getDB', () => ORM.db);
    server.method('getModel', name => ORM.db.models[name]);

    if (config.frontend.sentry) {
        await server.register({
            plugin: require('./utils/sentry'),
            options: { commit: server.app.GITHEAD }
        });
    }

    await server.register(require('./utils/dw-auth'));
    await server.register(require('./utils/features'));

    await waitForAPI(server);

    await server.register([require('./routes')]);
    server.logger.info('loading plugins...');
    await server.register([require('./utils/plugin-loader')]);

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

    await server.start();

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
};

start();
