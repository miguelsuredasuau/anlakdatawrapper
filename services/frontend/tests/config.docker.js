const path = require('path');
module.exports = {
    general: {
        localPluginRoot: path.join(process.cwd(), '../../plugins'),
        localChartAssetRoot: '/tmp/data',
        localChartPublishRoot: '/tmp/charts',
        imageDomain: 'charts.datawrapper.local/preview',
        defaultThemes: ['default', 'datawrapper'],
        locales: [
            { id: 'de-DE', title: 'Deutsch' },
            { id: 'en-US', title: 'English' }
        ]
    },
    frontend: {
        domain: 'localhost',
        apiUrl: 'http://localhost:3000',
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
    plugins: {
        'd3-bars': {}
    },
    orm: {
        chartIdSalt: 'TEST_SALT',
        skipTableTest: true,
        db: {
            dialect: 'mysql',
            host: 'mysql',
            port: 3306,
            user: 'test',
            password: 'test',
            database: 'test'
        }
    }
};
