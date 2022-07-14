const fs = require('fs/promises');
const path = require('path');

module.exports = function registerVisualization(server) {
    server.app.visualizations = new Map();
    return async function (plugin, visualizations = []) {
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
                server.methods.computeFileGlobHash(
                    path.join(__dirname, `../../plugins/${plugin}/less/**/*.less`)
                ),
                vis.controls
                    ? server.methods.computeFileHash(
                          path.join(__dirname, `../../plugins/${vis.controls.js}`)
                      )
                    : undefined,
                vis.script ? server.methods.computeFileHash(vis.script) : undefined
            ]);
            vis.__styleHash = styleHash;
            vis.__controlsHash = controlsHash;
            vis.__visHash = visHash;

            const pluginRoot = server.methods.config('general').localPluginRoot;
            if (!pluginRoot) {
                throw new Error('localPluginRoot must be defined to register visualization');
            }
            vis.icon = await fs.readFile(
                path.join(pluginRoot, plugin, 'static', `${vis.id}.svg`),
                'utf-8'
            );
            server.app.visualizations.set(vis.id, vis);
        }
    };
};
