import path from 'path';
import fs from 'fs-extra';
import { get } from 'lodash';
import type { Team } from './teamModelTypes';

const localeRoot = path.join(__dirname, '../node_modules/@datawrapper/locales/locales/');

type Locale = string;

type LocaleContent = string;

type Locales = Map<Locale, LocaleContent>;

type Vendors = {
    dayjs: Locales;
    numeral: Locales;
};

type LocaleConfig = Record<string, unknown>;

type LocaleMeta = {
    [local: Locale]: LocaleConfig;
};

async function loadLocalesForVendor(vendor: keyof Vendors): Promise<Locales> {
    const locales = new Map();
    const basePath = path.resolve(localeRoot, vendor);
    const files = await fs.readdir(basePath);
    for (let i = files.length - 1; i >= 0; i--) {
        const file = files[i] as string;
        if (/.*\.js/.test(file)) {
            const content = await fs.readFile(path.join(basePath, file), 'utf-8');
            locales.set(path.basename(file, '.js'), content);
        }
    }
    return locales;
}

export async function loadLocales(): Promise<Vendors> {
    return {
        dayjs: await loadLocalesForVendor('dayjs'),
        numeral: await loadLocalesForVendor('numeral')
    };
}

export async function loadVendorLocale(
    vendor: keyof Vendors,
    locale: Locale,
    team: Team
): Promise<{ base: LocaleContent | undefined; custom: unknown } | 'null'> {
    const locales = await loadLocales();
    const localeSettings = getVendorLocaleSettings(vendor, locale, locales);
    if (!localeSettings) return 'null';
    return {
        base: localeSettings,
        custom: get(team, `settings.locales.${vendor}.${locale.replace('_', '-')}`, {})
    };
}

export async function loadVendorLocales(
    vendor: keyof Vendors,
    locales: Locale[]
): Promise<Locales> {
    const availableLocales = await loadLocales();
    return Object.fromEntries(
        locales
            .map((locale: Locale) => [
                locale,
                getVendorLocaleSettings(vendor, locale, availableLocales)
            ])
            .filter(([, settings]) => !!settings)
    );
}

export async function loadLocaleConfig(locale: Locale): Promise<LocaleConfig | undefined> {
    const tryLocales = getLocaleCodeOptions(locale);
    const localeMeta = await loadLocaleMeta();
    const localeCode = tryLocales.find(l => l in localeMeta);
    return localeCode ? localeMeta[localeCode] : {};
}

export async function loadLocaleMeta(): Promise<LocaleMeta> {
    return JSON.parse(
        await fs.readFile(path.resolve(path.resolve(localeRoot, 'config.json')), 'utf-8')
    );
}

function getLocaleCodeOptions(locale: Locale): Locale[] {
    const culture = locale.replace('_', '-').toLowerCase();
    const tryLocales = [culture];
    if (culture.length > 2) {
        // also try just language as fallback
        tryLocales.push(culture.split('-')[0] as string);
    }
    return tryLocales;
}

function getVendorLocaleSettings(
    vendor: keyof Vendors,
    locale: Locale,
    locales: Vendors
): LocaleContent | undefined {
    const tryLocales = getLocaleCodeOptions(locale);
    for (let i = 0; i < tryLocales.length; i++) {
        if (locales[vendor].has(tryLocales[i] as string)) {
            return locales[vendor].get(tryLocales[i] as string);
        }
    }
    return undefined;
}
