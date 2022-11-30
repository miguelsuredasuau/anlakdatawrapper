async function findPlugins(dwPluginsInfo) {
    const plugins = {};
    for (const [pluginName, { pluginConfig, entryPoints }] of Object.entries(dwPluginsInfo)) {
        if (entryPoints.orm) {
            plugins[pluginName] = { pluginConfig, requirePath: entryPoints.orm };
        }
    }
    return plugins;
}

function createRegisterPlugins(ORM, plugins) {
    return async function registerPlugins(logger) {
        for (const [name, config] of Object.entries(plugins)) {
            const { pluginConfig, requirePath } = config;
            if (logger) {
                logger.info(`Registering ORM plugin ${name}...`);
            }
            const Plugin = require(requirePath);
            await Plugin.register(ORM, pluginConfig);
        }
    };
}

module.exports = { findPlugins, createRegisterPlugins };
