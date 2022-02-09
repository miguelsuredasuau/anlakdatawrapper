const Joi = require('joi');
const Boom = require('@hapi/boom');
const assign = require('assign-deep');
const { compileCSS } = require('../../publish/compile-css.js');

const themeId = () =>
    Joi.string()
        .lowercase()
        .pattern(/^[a-z0-9]+(?:-{0,2}[a-z0-9]+)*$/)
        .min(2);

async function validateThemeData(data, server) {
    try {
        await server.methods.validateThemeData(data);
    } catch (err) {
        if (err.name === 'ValidationError') {
            throw Boom.badRequest(err.details.map(e => `- ${e.message}`).join('\n'));
        } else {
            throw err;
        }
    }
}

async function validateThemeLess(less, server, themeId, data) {
    try {
        let extendedThemeData = {};
        if (server && themeId) {
            const { result: theme } = await server.inject({
                url: `/v3/themes/${themeId}?extend=true`
            });
            extendedThemeData = theme.data;
            if (data) assign(extendedThemeData, data);
        }
        const themeToValidate = { less, data: extendedThemeData };
        await compileCSS({
            theme: themeToValidate,
            filePaths: []
        });
    } catch (err) {
        if (['Parse', 'Name'].includes(err.type)) {
            throw Boom.badRequest(`LESS error: "${err.message}"`);
        } else {
            throw err;
        }
    }
}

module.exports = {
    themeId,
    validateThemeData,
    validateThemeLess
};
