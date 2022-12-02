/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Config } from '@datawrapper/backend-utils';
import { config as loadConfig } from 'dotenv';
import path from 'path';
loadConfig({
    path: path.resolve('../../utils/docker/.datawrapper_env')
});

const config: Config = {
    orm: {
        chartIdSalt: 'TEST_SALT',
        db: {
            dialect: 'mysql',
            host: 'localhost',
            port: parseInt(process.env['DW_DATABASE_HOST_PORT']!),
            user: process.env['DW_DATABASE_USER']!,
            password: process.env['DW_DATABASE_PASS']!,
            database: process.env['DW_DATABASE_NAME']!
        }
    }
};
export = config;
