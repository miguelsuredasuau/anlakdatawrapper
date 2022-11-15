"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegisterVisualization = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function registerVisualization(server, plugin, visualizations = []) {
    const pluginRoot = server.methods.config('general')['localPluginRoot'];
    if (!pluginRoot) {
        throw new Error('localPluginRoot must be defined to register visualization');
    }
    for (const vis of visualizations) {
        const visualization = server.app.visualizations.get(vis.id);
        if (visualization) {
            server.logger.warn({ status: 'skipping', registeredBy: plugin }, `[Visualization] "${vis.id}" already registered.`);
            return;
        }
        vis.__plugin = plugin;
        vis.libraries = vis.libraries || [];
        vis['svelte-workflow'] = vis['svelte-workflow'] || 'chart';
        vis.workflow = vis.workflow || 'chart';
        // compute hash for visualization styles and controls
        const [styleHash, controlsHash, visHash] = await Promise.all([
            server.methods.computeFileGlobHash(path_1.default.join(pluginRoot, plugin, 'less/**/*.less')),
            vis.controls
                ? server.methods.computeFileHash(path_1.default.join(pluginRoot, vis.controls.js))
                : undefined,
            vis.script ? server.methods.computeFileHash(vis.script) : undefined
        ]);
        vis.__styleHash = styleHash;
        vis.__controlsHash = controlsHash;
        vis.__visHash = visHash;
        vis.icon = await promises_1.default.readFile(path_1.default.join(pluginRoot, plugin, 'static', `${vis.id}.svg`), 'utf-8');
        server.app.visualizations.set(vis.id, vis);
    }
}
function createRegisterVisualization(server) {
    server.app.visualizations = new Map();
    return (plugin, visualizations) => registerVisualization(server, plugin, visualizations);
}
exports.createRegisterVisualization = createRegisterVisualization;
