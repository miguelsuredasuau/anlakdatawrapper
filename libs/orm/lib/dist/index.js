"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initORM = exports.SQ = void 0;
const backend_utils_1 = require("@datawrapper/backend-utils");
const sequelize_1 = require("sequelize");
var sequelize_2 = require("sequelize");
Object.defineProperty(exports, "SQ", { enumerable: true, get: function () { return __importDefault(sequelize_2).default; } });
const internal_orm_state_1 = require("./internal-orm-state");
const init_1 = require("./models/init");
const plugins_1 = require("./utils/plugins");
__exportStar(require("./models/allModelTypes"), exports);
async function create(config) {
    const dbConfig = config.orm?.db ?? config.db;
    if (!dbConfig || !config.orm) {
        throw new Error('Missing DB config');
    }
    const pluginsInfo = await (0, backend_utils_1.fetchAllPlugins)(config);
    const configuredPlugins = await (0, plugins_1.findPlugins)(pluginsInfo);
    const db = new sequelize_1.Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
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
        registerPlugins: (0, plugins_1.createRegisterPlugins)(db, configuredPlugins)
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
async function connect(ormConfig, db) {
    if (ormConfig.skipTableTest) {
        return;
    }
    const retrySeconds = ormConfig.retryInterval || 3;
    const retryInterval = retrySeconds * 1000;
    for (let remainingAttempts = ormConfig.retryLimit ?? 1000000;; remainingAttempts--) {
        try {
            await db.query('SELECT id FROM chart LIMIT 1');
            return;
        }
        catch (err) {
            if (err instanceof Error && err.name.startsWith('Sequelize') && ormConfig.retry) {
                console.warn(err.message);
                console.warn(`database is not ready, yet. retrying in ${retrySeconds} seconds...`);
                if (remainingAttempts <= 0) {
                    throw err;
                }
            }
            else {
                throw err;
            }
        }
        await sleep(retryInterval);
    }
}
const initORM = async (config) => {
    const { db, chartIdSalt, hashPublishing, ormConfig, registerPlugins } = await create(config);
    await connect(ormConfig, db);
    const dbWithModels = (0, init_1.initModels)({ db, chartIdSalt, hashPublishing });
    (0, internal_orm_state_1.setDB)(dbWithModels);
    return { db: dbWithModels, registerPlugins };
};
exports.initORM = initORM;
