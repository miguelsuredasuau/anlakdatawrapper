const Joi = require('joi');
const { chartListResponse } = require('../../utils/schemas');

module.exports = async server => {
    // GET /v3/me/recently-edited-charts
    // GET /v3/me/recently-published-charts

    ['edited', 'published'].forEach(type => {
        server.route({
            method: 'GET',
            path: `/recently-${type}-charts`,
            options: {
                tags: ['api'],
                description: `Get a list of your recently ${type} charts`,
                notes: 'Requires scopes `user:read` and `chart:read`.',
                auth: {
                    access: { scope: ['user:read', 'chart:read'] }
                },
                response: chartListResponse,
                validate: {
                    query: {
                        limit: Joi.number()
                            .integer()
                            .min(1)
                            .default(100)
                            .description('Maximum items to fetch. Useful for pagination.'),
                        offset: Joi.number()
                            .integer()
                            .min(0)
                            .default(0)
                            .description('Number of items to skip. Useful for pagination.')
                    }
                }
            },
            async handler(request, h) {
                const { limit, offset } = request.query;
                const res = await request.server.inject({
                    method: 'GET',
                    url: `/v3/users/${request.auth.artifacts.id}/recently-${type}-charts?limit=${limit}&offset=${offset}`,
                    auth: request.auth,
                    headers: request.headers,
                    payload: request.payload
                });

                return h.response(res.result).code(res.statusCode);
            }
        });
    });
};
