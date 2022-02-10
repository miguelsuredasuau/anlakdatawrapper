const mysql = require('mysql2/promise');
const logger = require('./logger');
const sleep = require('./sleep');

async function waitForDb(dbConfig, times = 1) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.connect();
        await connection.query('USE ' + dbConfig.database);
        return connection;
    } catch (e) {
        if (times > 5) {
            logger.error(`Unable to connect to database in ${times} attempts, exiting`);
            process.exit();
        }
        const backoff = 2 ** (times - 1) * 1000;
        logger.warn(`Unable to connect to database, trying again in ${backoff}ms`);
        await sleep(backoff);
        return await waitForDb(dbConfig, times + 1);
    }
}

module.exports = {
    waitForDb
};
