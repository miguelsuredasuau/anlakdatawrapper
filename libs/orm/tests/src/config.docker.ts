import type { Config } from '@datawrapper/backend-utils';
import path from 'path';
const config: Config = {
    general: {
        localPluginRoot: path.join(__dirname, '../../test-plugins')
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
export = config;
