const get = require('lodash/get');

function getUserLanguage(auth) {
    return auth.isAuthenticated && auth.artifacts && auth.artifacts.id
        ? auth.artifacts.language
        : get(auth.credentials, 'data.data.dw-lang') || 'en-US';
}

function byOrder(a, b) {
    return a.order !== undefined && b.order !== undefined ? a.order - b.order : 0;
}

module.exports = {
    getUserLanguage,
    byOrder
};
