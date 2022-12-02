import type { TeamModel } from '@datawrapper/orm';
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
export declare function loadLocales(): Promise<Vendors>;
export declare function loadVendorLocale(vendor: keyof Vendors, locale: Locale, team: TeamModel): Promise<{
    base: LocaleContent | undefined;
    custom: unknown;
} | 'null'>;
export declare function loadVendorLocales(vendor: keyof Vendors, locales: Locale[]): Promise<Locales>;
export declare function loadLocaleConfig(locale: Locale): Promise<LocaleConfig | undefined>;
export declare function loadLocaleMeta(): Promise<LocaleMeta>;
export {};
