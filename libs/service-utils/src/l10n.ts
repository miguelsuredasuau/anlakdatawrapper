import assign from 'assign-deep';
import escapeHtml from '@datawrapper/shared/escapeHtml';
import type { Request, RequestAuth } from './serverTypes';

type Messages = Record<string, string>;

type Scope = {
    [locale: string]: Messages;
};

type Scopes = {
    core: Scope;
    plugin: Scope;
    chart: Scope;
};

const scopes: Scopes = {
    core: {},
    plugin: {},
    chart: {}
};
const defaultLanguage = 'en_US';

const DW_DEV_MODE = !!JSON.parse(process.env['DW_DEV_MODE'] || 'false');

export function getLocalizationScope(
    scope: keyof Scopes,
    locale: string = defaultLanguage
): Messages {
    if (!scopes[scope]) {
        throw new Error(`Unknown localization scope "${scope}"`);
    }

    if (!scopes[scope][locale]) {
        const normalizedLocale = locale.replace('-', '_');
        if (scopes[scope][normalizedLocale]) {
            return scopes[scope][normalizedLocale] as Messages;
        }

        // try to find locale of same language
        const lang = locale.substring(0, 2);
        locale = Object.keys(scopes[scope]).find(loc => loc.startsWith(lang)) || defaultLanguage;
    }
    if (scopes[scope][locale]) {
        return scopes[scope][locale] as Messages;
    }
    // console.error(`l10n: Unknown locale "${locale}" for scope "${scope}"`);
    return {};
}

export function addLocalizationScope(scope: keyof Scopes, messages: Scope) {
    if (scope === 'chart') {
        Object.entries(messages).forEach(([key, value]) => {
            messages[key.replace('-', '_')] = value;
            delete messages[key];
        });
    }

    if (!scopes[scope]) {
        scopes[scope] = messages;
    } else {
        scopes[scope] = assign(scopes[scope], messages);
    }
}

/**
 * Replaces named placeholders marked with %, such as %name% or %id.
 *
 * TODO Merge with `shared/l10n.js`. But notice that we escape each value here in service-utils.
 */
function replaceNamedPlaceholders(text: string, replacements: Record<string, string> = {}): string {
    Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`%${k}%|%${k}(?!\\w)`, 'g'), escapeHtml(v));
    });
    return text;
}

function getLocalizationText(
    key: string,
    { scope = 'core', language = defaultLanguage }: { scope: keyof Scopes; language: string }
): string {
    try {
        const messages = getLocalizationScope(scope, language);
        if (messages[key]) {
            return messages[key] as string;
        }
        if (DW_DEV_MODE) {
            return 'MISSING ' + key;
        }
        const fallback = getLocalizationScope(scope, defaultLanguage);
        return fallback[key] || key;
    } catch (e) {
        return key;
    }
}

export function translate(
    key: string,
    {
        scope,
        language,
        replacements
    }: { scope: keyof Scopes; language: string; replacements?: Record<string, string> }
): string {
    const text = getLocalizationText(key, { scope, language });
    return replaceNamedPlaceholders(text, replacements);
}

export function allLocalizationScopes(locale: string = defaultLanguage): Scope {
    const out: Scope = {};
    (Object.keys(scopes) as (keyof Scopes)[]).forEach(scope => {
        out[scope] = Object.assign({}, getLocalizationScope(scope, locale)) as Messages;
        if (locale !== defaultLanguage) {
            // fill in empty keys with default language
            const fallback = getLocalizationScope(scope, defaultLanguage);
            Object.keys(out[scope] as Messages).forEach(key => {
                if (!(out[scope] as Messages)[key] && fallback[key]) {
                    (out[scope] as Messages)[key] = DW_DEV_MODE
                        ? 'MISSING ' + key
                        : (fallback[key] as string);
                }
            });
        }
    });
    return out;
}

export function getUserLanguage(auth: RequestAuth): string {
    return auth.isAuthenticated && auth.artifacts && auth.artifacts.id
        ? auth.artifacts.language
        : auth.credentials?.data?.data?.['dw-lang'] || 'en-US';
}

export function getTranslate(
    request: Request
): (key: string, scope: keyof Scopes, replacements: Record<string, string>) => string {
    const language = getUserLanguage(request.auth);
    return (key, scope = 'core', replacements) => translate(key, { scope, language, replacements });
}
