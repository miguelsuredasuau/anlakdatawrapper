const path = require('path');
require('dotenv').config({
    path: path.resolve('../../.datawrapper_env')
});

module.exports = {
    pixeltracker: {
        queue: {
            name: 'pixeltracker:test:flush',
            removeOnComplete: 50,
            removeOnFail: 50
        },
        api: {
            port: 3333,
            interval: 15000,
            reportFailuresPeriod: 2,
            reportQueuedJobs: 5
        },
        flusher: {
            port: 3334,
            db: {
                host: 'localhost',
                port: process.env.DW_DATABASE_HOST_PORT,
                user: process.env.DW_DATABASE_USER,
                password: process.env.DW_DATABASE_PASS,
                database: process.env.DW_DATABASE_NAME
            }
        },
        redis: {
            host: 'localhost',
            port: process.env.DW_REDIS_PORT,
            password: process.env.DW_REDIS_PASS
        }
    },
    orm: {
        db: {
            dialect: 'mysql',
            host: 'localhost',
            port: process.env.DW_DATABASE_HOST_PORT,
            user: process.env.DW_DATABASE_USER,
            password: process.env.DW_DATABASE_PASS,
            database: process.env.DW_DATABASE_NAME
        }
    }
};
