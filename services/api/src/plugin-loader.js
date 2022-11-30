const fs = require('fs');
const { fetchAllPlugins } = require('@datawrapper/backend-utils');
const models = require('@datawrapper/orm/models');
const { promisify } = require('util');
const { addLocalizationScope } = require('@datawrapper/service-utils');
const readFile = promisify(fs.readFile);

module.exports = {
    name: 'plugin-loader',
    version: '1.0.0',
    register: async server => {
        const config = server.methods.config();
        const pluginsInfo = Object.entries(await fetchAllPlugins(config));

        const loadedPlugins = {};
        for (const [name, { entryPoints }] of pluginsInfo) {
            if (!entryPoints.api) {
                continue;
            }

            try {
                loadedPlugins[name] = require(entryPoints.api);
            } catch (error) {
                server.logger.warn(
                    `[Plugin] ${name}\n\nCouldn't load ${entryPoints.api}.\n\nMaybe this error is helpful:\n${error.stack}`
                );
                server.logger.warn(error);
            }
        }

        for (const [pluginName, { getLocalesPaths, manifest, pluginConfig }] of pluginsInfo) {
            if (!(pluginName in loadedPlugins)) {
                continue;
            }

            const { name, version } = manifest;
            const { options: loadedOptions = {}, ...loadedPlugin } = loadedPlugins[pluginName];
            const { routes, ...opts } = loadedOptions;
            const plugin = {
                name,
                version,
                ...loadedPlugin
            };
            const options = {
                models,
                config: pluginConfig,
                tarball: `https://api.github.com/repos/datawrapper/plugin-${pluginName}/tarball`,
                ...opts
            };

            server.logger.info(`[Plugin] ${pluginName}@${version}`);
            // try to load locales
            try {
                const localesPaths = await getLocalesPaths();

                if (localesPaths.chartTranslations) {
                    // chart translations are special because they need to be passed
                    // to the chart-core so they are availabe in rendered charts
                    addLocalizationScope(
                        'chart',
                        JSON.parse(await readFile(localesPaths.chartTranslations))
                    );
                }

                options.locales = {};
                for (const [locale, localePath] of Object.entries(localesPaths.locales)) {
                    options.locales[locale] = JSON.parse(await readFile(localePath));
                }
                addLocalizationScope(pluginName, options.locales);
            } catch (error) {
                server.logger.debug(`Error while loading translations for ${name}`, error);
            }
            await server.register({ plugin, options }, { routes });
        }

        // emit PLUGINS_LOADED event so plugins who depend on other
        // plugins can safely initialize
        await server.app.events.emit(server.app.event.PLUGINS_LOADED);
    }
};
