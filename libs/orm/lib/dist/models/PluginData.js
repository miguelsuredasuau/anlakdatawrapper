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
const exported = (0, wrap_1.createExports)('plugin_data')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const Plugin_1 = __importDefault(require("./Plugin"));
class PluginData extends sequelize_1.Model {
    static async getJSONData(pluginId, key) {
        const pluginDataItem = await PluginData.findOne({
            attributes: ['data'],
            where: {
                plugin_id: pluginId,
                key
            },
            order: [['stored_at', 'DESC']]
        });
        if (!pluginDataItem) {
            return [];
        }
        return JSON.parse(pluginDataItem.data);
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    PluginData.init({
        id: {
            type: sequelize_1.default.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: sequelize_1.default.STRING(128),
            allowNull: false
        },
        data: sequelize_1.default.TEXT,
        stored_at: sequelize_1.default.DATE
    }, {
        createdAt: 'stored_at',
        tableName: 'plugin_data',
        indexes: [
            {
                type: 'UNIQUE',
                name: 'plugin_data_IDX_plugin_id_key',
                fields: ['plugin_id', 'key']
            }
        ],
        ...initOptions
    });
    PluginData.belongsTo(Plugin_1.default, { foreignKey: 'plugin_id' });
    Plugin_1.default.hasMany(PluginData, { as: 'PluginData' });
    return PluginData;
});
