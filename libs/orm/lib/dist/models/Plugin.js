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
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('plugin')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
class Plugin extends sequelize_1.Model {
    /*
     * use Plugin.register to make sure the apps' plugin show
     * up in the plugin database table
     */
    static async register(_app, plugins) {
        // make sure the plugins are in the plugin list
        await Plugin.bulkCreate(plugins.map(p => {
            return {
                id: p.replace('@datawrapper/plugin-', ''),
                enabled: true,
                is_private: false
            };
        }), { ignoreDuplicates: true });
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    Plugin.init({
        id: {
            type: sequelize_1.default.STRING(128),
            primaryKey: true
        },
        enabled: sequelize_1.default.BOOLEAN,
        is_private: sequelize_1.default.BOOLEAN // soon to be deprectad
    }, {
        createdAt: 'installed_at',
        tableName: 'plugin',
        ...initOptions
    });
    return Plugin;
});
