/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Config } from '@datawrapper/backend-utils';
import path from 'path';
const config: Config = {
    general: {
        localPluginRoot: path.resolve(path.join(__dirname, '../../test-plugins'))
    },
    plugins: {
        'orm-test': {},
        'orm-test-skip': {}
    },
    orm: {
        chartIdSalt: 'TEST_SALT',
        db: {
            dialect: 'mysql',
            host: process.env['DB_HOST']!,
            port: parseInt(process.env['DB_PORT']!),
            user: process.env['DB_USER']!,
            password: process.env['DB_PASSWORD']!,
            database: process.env['DB_NAME']!
        }
    }
};
export = config;
