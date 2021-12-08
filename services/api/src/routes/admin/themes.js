const { Theme } = require('@datawrapper/orm/models');
const { listResponse } = require('../../schemas/response');
const Joi = require('joi');

module.exports = {
    name: 'routes/admin/themes',
    version: '1.0.0',
    register
};

function register(server) {
    // GET /v3/admin/themes
    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: {
                strategy: 'admin',
                access: { scope: ['theme:read'] }
            },
            validate: {
                query: {
                    limit: Joi.number()
                        .integer()
                        .min(0)
                        .default(1000)
                        .description('Maximum items to fetch. Useful for pagination.'),
                    offset: Joi.number()
                        .integer()
                        .min(0)
                        .default(0)
                        .description('Number of items to skip. Useful for pagination.')
                }
            },
            response: listResponse
        },
        async handler(request) {
            const { count, rows } = await Theme.findAndCountAll({
                order: [['title', 'ASC']],
                limit: request.query.limit,
                offset: request.query.offset
            });
            return {
                total: count,
                list: rows.map(cleanTheme)
            };
        }
    });

    function cleanTheme(theme) {
        return {
            id: theme.id,
            title: theme.title,
            createdAt: theme.createdAt
        };
    }
}
