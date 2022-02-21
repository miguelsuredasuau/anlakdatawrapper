module.exports = {
    pixeltracker: {
        queue: {
            name: 'pixeltracker:flush',
            removeOnComplete: 50,
            removeOnFail: 50
        },
        api: {
            port: 3333,
            interval: 15000,
            reportQueuedJobs: 5,
            reportFailuresPeriod: 2
        },
        flusher: {
            port: 3334,
            db: {
                host: 'mysql',
                port: 3306,
                user: 'test',
                password: 'test',
                database: 'test'
            }
        },
        redis: {
            host: 'redis',
            port: 6379
        }
    },
    orm: {
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
