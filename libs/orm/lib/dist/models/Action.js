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
const exported = (0, wrap_1.createExports)('action')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const User_1 = __importDefault(require("./User"));
class Action extends sequelize_1.Model {
    /**
     * helper for logging a user action to the `action` table
     *
     * @param {integer} userId - user id
     * @param {string} key - the action key
     * @param {*} details - action details
     */
    static async logAction(userId, key, details) {
        return Action.create({
            key: key,
            user_id: userId ?? null,
            details: typeof details !== 'number' && typeof details !== 'string'
                ? JSON.stringify(details)
                : String(details)
        });
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    Action.init({
        id: {
            type: sequelize_1.default.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: sequelize_1.default.STRING(512),
        identifier: sequelize_1.default.STRING(512),
        details: sequelize_1.default.STRING(512),
        action_time: sequelize_1.default.DATE
    }, {
        createdAt: 'action_time',
        tableName: 'action',
        ...initOptions
    });
    Action.belongsTo(User_1.default, { foreignKey: 'user_id' });
    return Action;
});
