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
const exported = (0, wrap_1.createExports)('chart_access_token')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const generate_1 = __importDefault(require("nanoid/generate"));
const Chart_1 = __importDefault(require("./Chart"));
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
/*
 * this model is deprecated, we'll switch to AccessToken some day
 */
class ChartAccessToken extends sequelize_1.Model {
    static async newToken({ chart_id }) {
        return ChartAccessToken.create({
            chart_id,
            token: (0, generate_1.default)(alphabet, 32)
        });
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    ChartAccessToken.init({
        id: {
            type: sequelize_1.default.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: sequelize_1.default.STRING(128)
    }, {
        tableName: 'chart_access_token',
        ...initOptions
    });
    ChartAccessToken.belongsTo(Chart_1.default, { foreignKey: 'chart_id' });
    return ChartAccessToken;
});
