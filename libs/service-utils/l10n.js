const get = require('lodash/get');
const assign = require('assign-deep');
const scopes = {};
const defaultLanguage = 'en_US';

const DW_DEV_MODE = !!JSON.parse(process.env.DW_DEV_MODE || 'false');

function getScope(scope, locale = defaultLanguage) {
    if (!scopes[scope]) {
        throw new Error(`Unknown localization scope "${scope}"`);
    }

    if (!scopes[scope][locale]) {
        if (scopes[scope][locale.replace('-', '_')]) {
            return scopes[scope][locale.replace('-', '_')];
        }

        // try to find locale of same language
        const lang = locale.substr(0, 2);
        locale = Object.keys(scopes[scope]).find(loc => loc.startsWith(lang)) || defaultLanguage;
    }
    if (scopes[scope][locale]) {
        return scopes[scope][locale];
    }
    // console.error(`l10n: Unknown locale "${locale}" for scope "${scope}"`);
    return {};
}

function addScope(scope, messages) {
    if (scope === 'chart') {
        Object.keys(messages).forEach(key => {
            messages[key.replace('-', '_')] = messages[key];
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
 * Returns escaped HTML that can be used to display untrusted content.
 *
 * @param {string} unsafe
 * @returns {string}
 *
 * TODO Merge with `shared/escapeHtml.cjs`.
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Replaces named placeholders marked with %, such as %name% or %id.
 *
 * TODO Merge with `shared/l10n.js`. But notice that we escape each value here in service-utils.
 */
function replaceNamedPlaceholders(text, replacements = {}) {
    Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`%${k}%|%${k}(?!\\w)`, 'g'), escapeHtml(v));
    });
    return text;
}

function getText(key, { scope = 'core', language = defaultLanguage }) {
    try {
        const messages = getScope(scope, language);
        if (messages[key]) {
            return messages[key];
        }
        if (DW_DEV_MODE) {
            return 'MISSING ' + key;
        }
        const fallback = getScope(scope, defaultLanguage);
        return fallback[key] || key;
    } catch (e) {
        return key;
    }
}

function translate(key, { scope, language, replacements }) {
    const text = getText(key, { scope, language });
    return replaceNamedPlaceholders(text, replacements);
}

function allScopes(locale = defaultLanguage) {
    const out = {};
    Object.keys(scopes).forEach(scope => {
        out[scope] = Object.assign({}, getScope(scope, locale));
        if (locale !== defaultLanguage) {
            // fill in empty keys with default language
            const fallback = getScope(scope, defaultLanguage);
            Object.keys(out[scope]).forEach(key => {
                if (!out[scope][key] && fallback[key]) {
                    out[scope][key] = DW_DEV_MODE ? 'MISSING ' + key : fallback[key];
                }
            });
        }
    });
    return out;
}

function getUserLanguage(auth) {
    return auth.isAuthenticated && auth.artifacts && auth.artifacts.id
        ? auth.artifacts.language
        : get(auth.credentials, 'data.data.dw-lang') || 'en-US';
}

function getTranslate(request) {
    const language = getUserLanguage(request.auth);
    return (key, scope = 'core', replacements) => translate(key, { scope, language, replacements });
}

module.exports = {
    getScope,
    addScope,
    allScopes,
    translate,
    getUserLanguage,
    getTranslate
};
