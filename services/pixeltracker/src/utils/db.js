const mysql = require('mysql2/promise');
const logger = require('./logger');
const sleep = require('./sleep');

async function waitForDb(dbConfig) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.connect();
        await connection.query('USE ' + dbConfig.database);
        return connection;
    } catch (e) {
        logger.warn('Exception initializing database, trying again in 5 seconds...');
        await sleep(5000);
        return await waitForDb(dbConfig);
    }
}

module.exports = {
    waitForDb
};
