const Sequelize = require('sequelize');
const { fetchAllPlugins } = require('@datawrapper/backend-utils');
const { initModels } = require('./models/init');
const { findPlugins, createRegisterPlugins } = require('./utils/plugins');

let retries = 0;

const ORM = {
    async create(config) {
        const dbConfig = config.orm && config.orm.db ? config.orm.db : config.db;

        const pluginsInfo = await fetchAllPlugins(config);
        const configuredPlugins = await findPlugins(pluginsInfo);

        const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
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
        ORM.db = sequelize;
        ORM.db.Op = Sequelize.Op;
        ORM.db.Sequelize = Sequelize;
        ORM.token_salt = config.secure_auth_salt || '';
        ORM.chartIdSalt = config.orm.chartIdSalt;
        ORM.hashPublishing = config.orm.hashPublishing;
        ORM.plugins = configuredPlugins;
        ORM.registerPlugins = createRegisterPlugins(ORM, configuredPlugins);
    },

    /**
     * attempts to initialize the ORM. if it fails and
     * `config.orm.retry`` is true, it will retry connecting after
     * 10 seconds.
     */
    async connect(config) {
        const retryInterval = config.orm.retryInterval ? config.orm.retryInterval * 1000 : 3000;
        try {
            if (!config.orm.skipTableTest) {
                await ORM.db.query('SELECT id FROM chart LIMIT 1');
            }
        } catch (err) {
            if (err.name.substr(0, 9) === 'Sequelize' && config.orm && config.orm.retry) {
                console.warn(err.message);
                console.warn(
                    `database is not ready, yet. retrying in ${retryInterval / 1000} seconds...`
                );
                if (!config.orm.retryLimit || retries < config.orm.retryLimit) {
                    retries++;
                    await wait(() => this.connect(config), retryInterval);
                } else {
                    throw err;
                }
            } else {
                throw err;
            }
        }
        return ORM;
    },

    async init(config) {
        await this.create(config);
        await this.connect(config);
        initModels(ORM);
        return ORM;
    },

    db: {
        define() {
            console.error('you need to initialize the database first!');
            process.exit(-1);
        }
    }
};

module.exports = ORM;

function wait(f, ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(f());
            } catch (error) {
                reject(error);
            }
        }, ms);
    });
}
