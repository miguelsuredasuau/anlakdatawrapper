import fs from 'fs/promises';
import path from 'path';
import type { Server } from './serverTypes';
import type { Visualization } from './visualizationTypes';

async function registerVisualization(
    server: Server,
    plugin: string,
    visualizations: Visualization[] = []
) {
    const pluginRoot = server.methods.config('general')['localPluginRoot'] as string;
    if (!pluginRoot) {
        throw new Error('localPluginRoot must be defined to register visualization');
    }

    for (const vis of visualizations) {
        const visualization = server.app.visualizations.get(vis.id);

        if (visualization) {
            server.logger.warn(
                { status: 'skipping', registeredBy: plugin },
                `[Visualization] "${vis.id}" already registered.`
            );
            return;
        }

        vis.__plugin = plugin;
        vis.libraries = vis.libraries || [];
        vis['svelte-workflow'] = vis['svelte-workflow'] || 'chart';
        vis.workflow = vis.workflow || 'chart';

        // compute hash for visualization styles and controls
        const [styleHash, controlsHash, visHash] = await Promise.all([
            server.methods.computeFileGlobHash(path.join(pluginRoot, plugin, 'less/**/*.less')),
            vis.controls
                ? server.methods.computeFileHash(path.join(pluginRoot, vis.controls.js))
                : undefined,
            vis.script ? server.methods.computeFileHash(vis.script) : undefined
        ]);
        vis.__styleHash = styleHash;
        vis.__controlsHash = controlsHash;
        vis.__visHash = visHash;

        vis.icon = await fs.readFile(
            path.join(pluginRoot, plugin, 'static', `${vis.id}.svg`),
            'utf-8'
        );
        server.app.visualizations.set(vis.id, vis);
    }
}

export = function createRegisterVisualization(server: Server) {
    server.app.visualizations = new Map<string, Visualization>();
    return (plugin: string, visualizations?: Visualization[]) =>
        registerVisualization(server, plugin, visualizations);
};
