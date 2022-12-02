// load translations
import assign from 'assign-deep';
import path from 'path';
import fs from 'fs-extra';

const scopes = {
    core: {},
    plugin: {}
};

/**
 * loads locales so they are available in frontend tests.
 * will always load the 'core' scope, scopes for plugins are
 * loaded if the pluginId is given.
 *
 * @param rootPath path to code root
 * @param pluginIds array of plugin ids to load translations for
 */
export async function loadLocales(rootPath = path.join(__dirname, '../../..'), pluginIds = []) {
    await loadLocalesForScope('core', path.join(rootPath, 'services/frontend/locale'));
    for (const pluginId of pluginIds) {
        await loadLocalesForScope(pluginId, path.join(rootPath, `plugins/${pluginId}/locale`));
    }
}

async function loadLocalesForScope(scope, localePath) {
    try {
        const localeFiles = await fs.readdir(localePath);
        const locales = {};
        for (let i = 0; i < localeFiles.length; i++) {
            const file = localeFiles[i];
            if (/[a-z]+_[a-z]+\.json/i.test(file)) {
                locales[file.split('.')[0]] = JSON.parse(
                    await fs.readFile(path.join(localePath, file))
                );
            }
        }
        scopes[scope] = assign(scopes[scope], locales);
    } catch (e) {
        console.error('error loading locales for scope ' + scope, e);
    }
}

function getLocalizationScope(scope, locale) {
    const normalizedLocale = locale.replace('-', '_');
    return scopes[scope][normalizedLocale];
}

export function getLocale(language = 'en-US') {
    const out = {};
    Object.keys(scopes).forEach(scope => {
        out[scope] = getLocalizationScope(scope, language) ?? {};
    });
    return out;
}
