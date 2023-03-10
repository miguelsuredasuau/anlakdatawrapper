const Joi = require('joi');
const { createResponseConfig } = require('../../utils/schemas');

module.exports = async server => {
    server.route({
        method: 'PATCH',
        path: '/settings',
        options: {
            tags: ['api'],
            description: 'Update your account settings',
            auth: {
                access: { scope: ['user:write'] }
            },
            notes: `Use this endpoint to change your active team. Requires scope \`user:write\`.`,
            validate: {
                payload: {
                    activeTeam: Joi.string()
                        .allow(null)
                        .example('teamxyz')
                        .description('Your active team')
                }
            },
            response: createResponseConfig({
                schema: Joi.object({
                    activeTeam: Joi.string().allow(null),
                    updatedAt: Joi.date()
                }).unknown()
            })
        },
        async handler(request, h) {
            const res = await request.server.inject({
                method: 'PATCH',
                url: `/v3/users/${request.auth.artifacts.id}/settings`,
                auth: request.auth,
                headers: request.headers,
                payload: request.payload
            });

            return h.response(res.result).code(res.statusCode);
        }
    });
};
