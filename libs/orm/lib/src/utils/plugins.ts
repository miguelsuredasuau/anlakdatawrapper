import type { PluginsInfo } from '@datawrapper/backend-utils';
import type { Sequelize } from 'sequelize';

type PluginsData = Record<string, Record<string, unknown> & { requirePath: string }>;

export async function findPlugins(dwPluginsInfo: PluginsInfo) {
    const plugins: PluginsData = {};
    for (const [pluginName, { pluginConfig, entryPoints }] of Object.entries(dwPluginsInfo)) {
        if (entryPoints.orm) {
            plugins[pluginName] = { pluginConfig, requirePath: entryPoints.orm };
        }
    }
    return plugins;
}

export function createRegisterPlugins(db: Sequelize, plugins: PluginsData) {
    return async function registerPlugins(logger?: { info(message: string): void }) {
        for (const [name, config] of Object.entries(plugins)) {
            const { pluginConfig, requirePath } = config;
            if (logger) {
                logger.info(`Registering ORM plugin ${name}...`);
            }
            const Plugin = await import(requirePath);
            await Plugin.register({ db }, pluginConfig);
        }
    };
}
