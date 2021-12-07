const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const stat = promisify(fs.stat);

async function findPlugins(localPluginRoot, dwPlugins) {
    const plugins = {};
    for (const plugin of Object.entries(dwPlugins)) {
        const indexFiles = ['orm.cjs', 'orm.js'];
        for (const indexFile of indexFiles) {
            try {
                const requirePath = path.resolve(localPluginRoot, plugin[0], indexFile);
                await stat(requirePath);
                plugins[plugin[0]] = plugin[1];
                plugins[plugin[0]].requirePath = requirePath;
                break;
            } catch (error) {
                // intentionally left empty, this is not an error
                // the plugin just does not have a orm.js file
            }
        }
    }

    return plugins;
}

function createRegisterPlugins(ORM, plugins) {
    return async function registerPlugins() {
        for (const [name, config] of Object.entries(plugins)) {
            const Plugin = require(plugins[name].requirePath);
            await Plugin.register(ORM, config);
        }
    };
}

module.exports = { findPlugins, createRegisterPlugins };
