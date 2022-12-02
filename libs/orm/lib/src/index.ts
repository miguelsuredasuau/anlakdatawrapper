import { Config, fetchAllPlugins } from '@datawrapper/backend-utils';
import { Dialect, Sequelize } from 'sequelize';
import type { DB } from './dbTypes';
export { default as SQ } from 'sequelize';
import { setDB } from './internal-orm-state';
import { initModels } from './models/init';
import { findPlugins, createRegisterPlugins } from './utils/plugins';
export type { DB };
export * from './models/allModelTypes';

async function create(config: Config) {
    const dbConfig = config.orm?.db ?? config.db;
    if (!dbConfig || !config.orm) {
        throw new Error('Missing DB config');
    }

    const pluginsInfo = await fetchAllPlugins(config);
    const configuredPlugins = await findPlugins(pluginsInfo);

    const db = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect as Dialect,
        logging: process.env['DEV'] ? s => process.stdout.write(s + '\n') : false,
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
        ormConfig: config.orm,
        registerPlugins: createRegisterPlugins(db, configuredPlugins)
    };
}

function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
}

/**
 * attempts to initialize the ORM. if it fails and
 * `config.orm.retry`` is true, it will retry connecting after
 * 10 seconds.
 */
async function connect(ormConfig: NonNullable<Config['orm']>, db: Sequelize) {
    if (ormConfig.skipTableTest) {
        return;
    }

    const retrySeconds = ormConfig.retryInterval || 3;
    const retryInterval = retrySeconds * 1000;
    for (let remainingAttempts = ormConfig.retryLimit ?? 1000000; ; remainingAttempts--) {
        try {
            await db.query('SELECT id FROM chart LIMIT 1');
            return;
        } catch (err) {
            if (err instanceof Error && err.name.startsWith('Sequelize') && ormConfig.retry) {
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

export const initORM = async (config: Config) => {
    const { db, chartIdSalt, hashPublishing, ormConfig, registerPlugins } = await create(config);
    await connect(ormConfig, db);
    const dbWithModels = initModels({ db, chartIdSalt, hashPublishing });
    setDB(dbWithModels);
    return { db: dbWithModels, registerPlugins };
};
