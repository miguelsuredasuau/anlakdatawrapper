"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLocaleMeta = exports.loadLocaleConfig = exports.loadVendorLocales = exports.loadVendorLocale = exports.loadLocales = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const lodash_1 = require("lodash");
const localeRoot = path_1.default.join(__dirname, '../node_modules/@datawrapper/locales/locales/');
async function loadLocalesForVendor(vendor) {
    const locales = new Map();
    const basePath = path_1.default.resolve(localeRoot, vendor);
    const files = await fs_extra_1.default.readdir(basePath);
    for (let i = files.length - 1; i >= 0; i--) {
        const file = files[i];
        if (/.*\.js/.test(file)) {
            const content = await fs_extra_1.default.readFile(path_1.default.join(basePath, file), 'utf-8');
            locales.set(path_1.default.basename(file, '.js'), content);
        }
    }
    return locales;
}
async function loadLocales() {
    return {
        dayjs: await loadLocalesForVendor('dayjs'),
        numeral: await loadLocalesForVendor('numeral')
    };
}
exports.loadLocales = loadLocales;
async function loadVendorLocale(vendor, locale, team) {
    const locales = await loadLocales();
    const localeSettings = getVendorLocaleSettings(vendor, locale, locales);
    if (!localeSettings)
        return 'null';
    return {
        base: localeSettings,
        custom: (0, lodash_1.get)(team, `settings.locales.${vendor}.${locale.replace('_', '-')}`, {})
    };
}
exports.loadVendorLocale = loadVendorLocale;
async function loadVendorLocales(vendor, locales) {
    const availableLocales = await loadLocales();
    return Object.fromEntries(locales
        .map((locale) => [
        locale,
        getVendorLocaleSettings(vendor, locale, availableLocales)
    ])
        .filter(([, settings]) => !!settings));
}
exports.loadVendorLocales = loadVendorLocales;
async function loadLocaleConfig(locale) {
    const tryLocales = getLocaleCodeOptions(locale);
    const localeMeta = await loadLocaleMeta();
    const localeCode = tryLocales.find(l => l in localeMeta);
    return localeCode ? localeMeta[localeCode] : {};
}
exports.loadLocaleConfig = loadLocaleConfig;
async function loadLocaleMeta() {
    return JSON.parse(await fs_extra_1.default.readFile(path_1.default.resolve(path_1.default.resolve(localeRoot, 'config.json')), 'utf-8'));
}
exports.loadLocaleMeta = loadLocaleMeta;
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
