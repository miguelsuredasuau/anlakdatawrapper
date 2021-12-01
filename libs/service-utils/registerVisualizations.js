const fs = require('fs');
const path = require('path');

module.exports = function registerVisualization(server) {
    server.app.visualizations = new Map();
    return function (plugin, visualizations = []) {
        visualizations.forEach(vis => {
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

            // load githead from plugin
            const pluginRoot = server.methods.config('general').localPluginRoot;
            if (!pluginRoot) {
                throw new Error('localPluginRoot must be defined to register visualization');
            }
            const pluginGitHead = path.join(pluginRoot, plugin, '.githead');
            if (fs.existsSync(pluginGitHead)) {
                vis.githead = fs.readFileSync(pluginGitHead, 'utf-8');
            } else {
                // fallback to timestamp
                vis.githead = String(new Date().getTime());
            }
            server.app.visualizations.set(vis.id, vis);
        });
    };
};
