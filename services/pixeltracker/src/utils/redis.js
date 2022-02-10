const Redis = require('ioredis');
const logger = require('./logger');

async function waitForRedis(redisConfig) {
    return new Promise(resolve => {
        const redis = new Redis({
            ...redisConfig,
            retryStrategy(times) {
                if (times > 5) {
                    logger.error(`Unable to connect to Redis in ${times} attempts, exiting`);
                    process.exit();
                }
                const backoff = 2 ** (times - 1) * 1000;
                logger.warn(`Unable to connect to Redis, trying again in ${backoff}ms`);
                return backoff;
            }
        });
        redis.on('connect', () => {
            redis.disconnect();
            resolve();
        });
    });
}

module.exports = {
    waitForRedis
};
