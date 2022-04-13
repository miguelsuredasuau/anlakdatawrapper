const path = require('path');
const fs = require('fs-extra');
const { get } = require('lodash');

const localePath = './node_modules/@datawrapper/locales/locales/';

async function loadLocales() {
    const VENDORS = ['dayjs', 'numeral'];
    const locales = [];

    for (const vendor of VENDORS) {
        locales[vendor] = new Map();
        const basePath = path.resolve(__dirname, localePath, vendor);
        const files = await fs.readdir(basePath);
        for (let i = files.length - 1; i >= 0; i--) {
            const file = files[i];
            if (/.*\.js/.test(file)) {
                const content = await fs.readFile(path.join(basePath, file), 'utf-8');
                locales[vendor].set(path.basename(file, '.js'), content);
            }
        }
    }
    return locales;
}

async function loadVendorLocale(vendor, locale, team) {
    const locales = await loadLocales();
    const tryLocales = getLocaleCodeOptions(locale);
    for (let i = 0; i < tryLocales.length; i++) {
        if (locales[vendor].has(tryLocales[i])) {
            const localeBase = locales[vendor].get(tryLocales[i]);
            return {
                base: localeBase,
                custom: get(team, `settings.locales.${vendor}.${locale.replace('_', '-')}`, {})
            };
        }
    }
    // no locale found at all
    return 'null';
}

async function loadLocaleConfig(locale) {
    const tryLocales = getLocaleCodeOptions(locale);
    const localeConfig = JSON.parse(
        await fs.readFile(path.resolve(path.resolve(__dirname, localePath, 'config.json')))
    );
    const localeCode = tryLocales.find(l => l in localeConfig);
    return localeCode ? localeConfig[localeCode] : {};
}

function getLocaleCodeOptions(locale) {
    const culture = locale.replace('_', '-').toLowerCase();
    const tryLocales = [culture];
    if (culture.length > 2) {
        // also try just language as fallback
        tryLocales.push(culture.split('-')[0]);
    }
    return tryLocales;
}

module.exports = {
    loadLocales,
    loadLocaleConfig,
    loadVendorLocale
};
