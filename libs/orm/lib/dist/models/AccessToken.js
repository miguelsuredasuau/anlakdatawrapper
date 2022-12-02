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
const exported = (0, wrap_1.createExports)('access_token')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const generate_1 = __importDefault(require("nanoid/generate"));
const User_1 = __importDefault(require("./User"));
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
class AccessToken extends sequelize_1.Model {
    static async newToken({ user_id, type, data }) {
        return AccessToken.create({
            user_id,
            type,
            data: data || {},
            token: (0, generate_1.default)(alphabet, 64)
        });
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    AccessToken.init({
        id: {
            type: sequelize_1.default.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: sequelize_1.default.STRING(64),
        token: sequelize_1.default.STRING(128),
        last_used_at: sequelize_1.default.DATE,
        data: sequelize_1.default.JSON
    }, {
        tableName: 'access_token',
        ...initOptions
    });
    AccessToken.belongsTo(User_1.default, { foreignKey: 'user_id' });
    return AccessToken;
});
