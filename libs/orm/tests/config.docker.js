const path = require('path');
module.exports = {
    general: {
        localPluginRoot: path.join(__dirname, '../plugins')
    },
    plugins: {
        'orm-test': {},
        'orm-test-skip': {}
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
