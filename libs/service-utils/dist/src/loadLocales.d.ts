import type { Team } from './teamModelTypes';
declare type Locale = string;
declare type LocaleContent = string;
declare type Locales = Map<Locale, LocaleContent>;
declare type Vendors = {
    dayjs: Locales;
    numeral: Locales;
};
declare type LocaleConfig = Record<string, unknown>;
declare type LocaleMeta = {
    [local: Locale]: LocaleConfig;
};
declare function loadLocales(): Promise<Vendors>;
declare function loadVendorLocale(vendor: keyof Vendors, locale: Locale, team: Team): Promise<{
    base: LocaleContent | undefined;
    custom: unknown;
} | 'null'>;
declare function loadVendorLocales(vendor: keyof Vendors, locales: Locale[]): Promise<Locales>;
declare function loadLocaleConfig(locale: Locale): Promise<LocaleConfig | undefined>;
declare function loadLocaleMeta(): Promise<LocaleMeta>;
declare const _default: {
    loadLocaleMeta: typeof loadLocaleMeta;
    loadLocales: typeof loadLocales;
    loadLocaleConfig: typeof loadLocaleConfig;
    loadVendorLocale: typeof loadVendorLocale;
    loadVendorLocales: typeof loadVendorLocales;
};
export = _default;
