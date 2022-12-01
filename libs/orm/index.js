const Sequelize = require('sequelize');
const { fetchAllPlugins } = require('@datawrapper/backend-utils');
const { setDB } = require('./internal-orm-state');
const { initModels } = require('./models/init');
const { findPlugins, createRegisterPlugins } = require('./utils/plugins');

async function create(config) {
    const dbConfig = config.orm && config.orm.db ? config.orm.db : config.db;

    const pluginsInfo = await fetchAllPlugins(config);
    const configuredPlugins = await findPlugins(pluginsInfo);

    const db = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: process.env.DEV ? s => process.stdout.write(s + '\n') : false,
        define: {
            timestamps: true,
            updatedAt: false,
            underscored: true
        }
    });
    return {
        db,
        chartIdSalt: config.orm.chartIdSalt,
        hashPublishing: config.orm.hashPublishing,
        registerPlugins: createRegisterPlugins({ db }, configuredPlugins)
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}

/**
 * attempts to initialize the ORM. if it fails and
 * `config.orm.retry`` is true, it will retry connecting after
 * 10 seconds.
 */
async function connect(config, { db }) {
    if (config.orm.skipTableTest) {
        return;
    }

    const retrySeconds = config.orm.retryInterval || 3;
    const retryInterval = retrySeconds * 1000;
    for (let remainingAttempts = config.orm.retryLimit ?? 1000000; ; remainingAttempts--) {
        try {
            await db.query('SELECT id FROM chart LIMIT 1');
            return;
        } catch (err) {
            if (err.name.substr(0, 9) === 'Sequelize' && config.orm && config.orm.retry) {
                console.warn(err.message);
                console.warn(`database is not ready, yet. retrying in ${retrySeconds} seconds...`);
                if (remainingAttempts <= 0) {
                    throw err;
                }
            } else {
                throw err;
            }
        }

        await sleep(retryInterval);
    }
}

exports.initORM = async config => {
    const { db, chartIdSalt, hashPublishing, registerPlugins } = await create(config);
    await connect(config, { db });
    initModels({ db, chartIdSalt, hashPublishing });
    setDB(db);
    return { db, registerPlugins };
};

exports.SQ = Sequelize;
