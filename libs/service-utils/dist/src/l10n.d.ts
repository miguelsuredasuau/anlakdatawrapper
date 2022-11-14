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
declare function getScope(scope: keyof Scopes, locale?: string): Messages;
declare function addScope(scope: keyof Scopes, messages: Scope): void;
declare function translate(key: string, { scope, language, replacements }: {
    scope: keyof Scopes;
    language: string;
    replacements?: Record<string, string>;
}): string;
declare function allScopes(locale?: string): Scope;
declare function getUserLanguage(auth: RequestAuth): string;
declare function getTranslate(request: Request): (key: string, scope: keyof Scopes, replacements: Record<string, string>) => string;
declare const _default: {
    getScope: typeof getScope;
    addScope: typeof addScope;
    allScopes: typeof allScopes;
    translate: typeof translate;
    getUserLanguage: typeof getUserLanguage;
    getTranslate: typeof getTranslate;
};
export = _default;
