import type { Request, RequestAuth } from './serverTypes';
declare type Messages = Record<string, string>;
declare type Scope = {
    [locale: string]: Messages;
};
declare type Scopes = {
    core: Scope;
    plugin: Scope;
    chart: Scope;
};
export declare function getLocalizationScope(scope: keyof Scopes, locale?: string): Messages;
export declare function addLocalizationScope(scope: keyof Scopes, messages: Scope): void;
export declare function translate(key: string, { scope, language, replacements }: {
    scope: keyof Scopes;
    language: string;
    replacements?: Record<string, string>;
}): string;
export declare function allLocalizationScopes(locale?: string): Scope;
export declare function getUserLanguage(auth: RequestAuth): string;
export declare function getTranslate(request: Request): (key: string, scope: keyof Scopes, replacements: Record<string, string>) => string;
export {};
