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
    const localeSettings = getVendorLocaleSettings(vendor, locale, locales);
    if (!localeSettings) return 'null';
    return {
        base: localeSettings,
        custom: get(team, `settings.locales.${vendor}.${locale.replace('_', '-')}`, {})
    };
}

async function loadVendorLocales(vendor, locales) {
    const availableLocales = await loadLocales();
    return Object.fromEntries(
        locales
            .map(locale => [locale, getVendorLocaleSettings(vendor, locale, availableLocales)])
            .filter(([, settings]) => !!settings)
    );
}

async function loadLocaleConfig(locale) {
    const tryLocales = getLocaleCodeOptions(locale);
    const localeMeta = await loadLocaleMeta();
    const localeCode = tryLocales.find(l => l in localeMeta);
    return localeCode ? localeMeta[localeCode] : {};
}

async function loadLocaleMeta() {
    return JSON.parse(
        await fs.readFile(path.resolve(path.resolve(__dirname, localePath, 'config.json')))
    );
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

function getVendorLocaleSettings(vendor, locale, locales) {
    const tryLocales = getLocaleCodeOptions(locale);
    for (let i = 0; i < tryLocales.length; i++) {
        if (locales[vendor].has(tryLocales[i])) {
            return locales[vendor].get(tryLocales[i]);
        }
    }
    return undefined;
}

module.exports = {
    loadLocaleMeta,
    loadLocales,
    loadLocaleConfig,
    loadVendorLocale,
    loadVendorLocales
};
