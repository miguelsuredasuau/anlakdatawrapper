module.exports = {
    pixeltracker: {
        port: 3333,
        intervalMin: 10000,
        intervalMax: 20000,
        db: {
            host: 'mysql',
            port: 3306,
            user: 'test',
            password: 'test',
            database: 'test'
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
