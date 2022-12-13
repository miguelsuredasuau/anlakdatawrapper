"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranslate = exports.getUserLanguage = exports.allLocalizationScopes = exports.translate = exports.addLocalizationScope = exports.getLocalizationScope = void 0;
const assign_deep_1 = __importDefault(require("assign-deep"));
const escapeHtml_1 = __importDefault(require("@datawrapper/shared/escapeHtml"));
const scopes = {
    core: {},
    plugin: {},
    chart: {}
};
const defaultLanguage = 'en_US';
const DW_DEV_MODE = !!JSON.parse(process.env['DW_DEV_MODE'] || 'false');
function getLocalizationScope(scope, locale = defaultLanguage) {
    if (!scopes[scope]) {
        throw new Error(`Unknown localization scope "${scope}"`);
    }
    if (!scopes[scope][locale]) {
        const normalizedLocale = locale.replace('-', '_');
        if (scopes[scope][normalizedLocale]) {
            return scopes[scope][normalizedLocale];
        }
        // try to find locale of same language
        const lang = locale.substring(0, 2);
        locale = Object.keys(scopes[scope]).find(loc => loc.startsWith(lang)) || defaultLanguage;
    }
    if (scopes[scope][locale]) {
        return scopes[scope][locale];
    }
    // console.error(`l10n: Unknown locale "${locale}" for scope "${scope}"`);
    return {};
}
exports.getLocalizationScope = getLocalizationScope;
function addLocalizationScope(scope, messages) {
    if (scope === 'chart') {
        Object.entries(messages).forEach(([key, value]) => {
            messages[key.replace('-', '_')] = value;
            delete messages[key];
        });
    }
    if (!scopes[scope]) {
        scopes[scope] = messages;
    }
    else {
        scopes[scope] = (0, assign_deep_1.default)(scopes[scope], messages);
    }
}
exports.addLocalizationScope = addLocalizationScope;
/**
 * Replaces named placeholders marked with %, such as %name% or %id.
 *
 * TODO Merge with `shared/l10n.js`. But notice that we escape each value here in service-utils.
 */
function replaceNamedPlaceholders(text, replacements = {}) {
    Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`%${k}%|%${k}(?!\\w)`, 'g'), (0, escapeHtml_1.default)(v));
    });
    return text;
}
function getLocalizationText(key, { scope = 'core', language = defaultLanguage }) {
    try {
        const messages = getLocalizationScope(scope, language);
        if (messages[key]) {
            return messages[key];
        }
        if (DW_DEV_MODE) {
            return 'MISSING ' + key;
        }
        const fallback = getLocalizationScope(scope, defaultLanguage);
        return fallback[key] || key;
    }
    catch (e) {
        return key;
    }
}
function translate(key, { scope, language, replacements }) {
    const text = getLocalizationText(key, { scope, language });
    return replaceNamedPlaceholders(text, replacements);
}
exports.translate = translate;
function allLocalizationScopes(locale = defaultLanguage) {
    const out = {};
    Object.keys(scopes).forEach(scope => {
        out[scope] = Object.assign({}, getLocalizationScope(scope, locale));
        if (locale !== defaultLanguage) {
            // fill in empty keys with default language
            const fallback = getLocalizationScope(scope, defaultLanguage);
            Object.keys(out[scope]).forEach(key => {
                if (!out[scope][key] && fallback[key]) {
                    out[scope][key] = DW_DEV_MODE
                        ? 'MISSING ' + key
                        : fallback[key];
                }
            });
        }
    });
    return out;
}
exports.allLocalizationScopes = allLocalizationScopes;
function getUserLanguage(auth) {
    return auth.isAuthenticated && auth.artifacts && auth.artifacts.id
        ? auth.artifacts.language
        : auth.credentials?.data?.data?.['dw-lang'] || 'en-US';
}
exports.getUserLanguage = getUserLanguage;
function getTranslate(request) {
    const language = getUserLanguage(request.auth);
    return (key, scope = 'core', replacements) => translate(key, { scope, language, replacements });
}
exports.getTranslate = getTranslate;
