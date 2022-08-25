const path = require('path');

require('dotenv').config({
    path: path.resolve('../../.datawrapper_env')
});

module.exports = {
    general: {
        localPluginRoot: path.join(process.cwd(), '../../plugins'),
        localChartAssetRoot: '/tmp/data',
        localChartPublishRoot: '/tmp/charts',
        imageDomain: process.env.DW_THUMBNAIL_URL,
        defaultThemes: ['default', 'datawrapper'],
        locales: [
            { id: 'de-DE', title: 'Deutsch' },
            { id: 'en-US', title: 'English' }
        ]
    },
    frontend: {
        domain: 'localhost',
        https: false
    },
    api: {
        domain: 'localhost',
        sessionID: 'DW-SESSION',
        enableMigration: true,
        hashRounds: 5,
        secretAuthSalt: 'MY_SECRET_AUTH_KEY',
        cors: ['*'],
        openCage: 'fake-opencage-key'
    },
    opensearch: {
        host: 'localhost',
        protocol: 'http',
        port: 9200,
        index: 'chart_idx'
    },
    plugins: {},
    orm: {
        db: {
            dialect: 'mysql',
            host: 'localhost',
            port: process.env.DW_DATABASE_HOST_PORT,
            user: process.env.DW_DATABASE_USER,
            password: process.env.DW_DATABASE_PASS,
            database: process.env.DW_DATABASE_NAME
        }
    },
    worker: {
        queueNames: ['test'],
        redis: {
            host: 'localhost',
            port: process.env['DW_REDIS_PORT'],
            password: process.env['DW_REDIS_PASS']
        }
    }
};
