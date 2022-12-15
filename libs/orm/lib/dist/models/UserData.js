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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('user_data')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const User_1 = __importDefault(require("./User"));
class UserData extends sequelize_1.Model {
    /**
     * a quick way to retreive a user setting stored in user_data
     * @param {number} userId
     * @param {string} key
     * @param {string} _default - fallback value to be used if key not set yet
     * @param {object} [options] - options object
     * @param {object} [options.transaction=null] - database transactiosn
     * @returns {string} the stored value or `_default`
     */
    static async getUserData(userId, key, _default, options) {
        const row = await UserData.findOne({
            where: { user_id: userId, key },
            ...options
        });
        return row ? row.data : _default;
    }
    /**
     * a quick way to set or update a user setting in user_data
     * @param {number} userId
     * @param {string} key
     * @param {string} value
     * @param {object} [options] - options object
     * @param {object} [options.transaction=null] - database transactiosn
     */
    static async setUserData(userId, key, value, options) {
        // TODO: Clean up this function, so that we don't need to disable `no-non-null-assertion`.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return UserData.sequelize.query('INSERT INTO user_data(user_id, `key`, value, stored_at) VALUES (:userId, :key, :value, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE value = :value, stored_at = CURRENT_TIMESTAMP', {
            replacements: { userId, key, value },
            type: sequelize_1.QueryTypes.RAW,
            ...options
        });
    }
    /**
     * a quick way to remove user setting in user_data
     * @param {number} userId
     * @param {string} key
     */
    static async unsetUserData(userId, key) {
        if (!key)
            return;
        return UserData.destroy({
            where: {
                user_id: userId,
                key
            }
        });
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    UserData.init({
        id: {
            type: sequelize_1.default.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: sequelize_1.default.STRING(128),
            allowNull: false
        },
        data: {
            type: sequelize_1.default.TEXT,
            field: 'value'
        }
    }, {
        createdAt: 'stored_at',
        tableName: 'user_data',
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'key']
            }
        ],
        ...initOptions
    });
    UserData.belongsTo(User_1.default, { foreignKey: 'user_id' });
    User_1.default.hasMany(UserData, { as: 'UserData' });
    return UserData;
});
