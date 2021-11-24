// load translations
import path from 'path';
import fs from 'fs-extra';
import { addScope, allScopes } from '@datawrapper/service-utils/l10n';

export async function loadLocales() {
    try {
        const localePath = path.join(__dirname, '../locale');
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
        addScope('core', locales);
    } catch (e) {
        console.error('error loading locales', e);
    }
}

export function getLocale(language = 'en-US') {
    return allScopes(language);
}
