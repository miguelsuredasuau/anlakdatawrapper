const get = require('lodash/get');
const assign = require('assign-deep');
const scopes = {};
const defaultLanguage = 'en_US';

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

function translate(key, { scope = 'core', language = defaultLanguage }) {
    try {
        const messages = getScope(scope, language);
        if (messages[key]) {
            return messages[key];
        }
        if (process.env.DW_DEV_MODE) {
            return 'MISSING ' + key;
        }
        const fallback = getScope(scope, defaultLanguage);
        return fallback[key] || key;
    } catch (e) {
        return key;
    }
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
                    out[scope][key] = process.env.DW_DEV_MODE ? 'MISSING ' + key : fallback[key];
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
    return (key, scope = 'core') => translate(key, { scope, language });
}

module.exports = {
    getScope,
    addScope,
    allScopes,
    translate,
    getUserLanguage,
    getTranslate
};
