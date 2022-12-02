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
exports.createRegisterPlugins = exports.findPlugins = void 0;
async function findPlugins(dwPluginsInfo) {
    const plugins = {};
    for (const [pluginName, { pluginConfig, entryPoints }] of Object.entries(dwPluginsInfo)) {
        if (entryPoints.orm) {
            plugins[pluginName] = { pluginConfig, requirePath: entryPoints.orm };
        }
    }
    return plugins;
}
exports.findPlugins = findPlugins;
function createRegisterPlugins(db, plugins) {
    return async function registerPlugins(logger) {
        var _a;
        for (const [name, config] of Object.entries(plugins)) {
            const { pluginConfig, requirePath } = config;
            if (logger) {
                logger.info(`Registering ORM plugin ${name}...`);
            }
            const Plugin = await (_a = requirePath, Promise.resolve().then(() => __importStar(require(_a))));
            await Plugin.register({ db }, pluginConfig);
        }
    };
}
exports.createRegisterPlugins = createRegisterPlugins;
