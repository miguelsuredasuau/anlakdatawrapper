const { UserData } = require('@datawrapper/orm/db');
const Boom = require('@hapi/boom');
const Joi = require('joi');

const { createResponseConfig } = require('../../../utils/schemas');

module.exports = async server => {
    // PATCH /v3/users/{id}/data
    server.route({
        method: 'PATCH',
        path: '/data',
        options: {
            description: 'Update user data',
            notes: `Requires scope \`user:write\`.`,
            auth: {
                access: { scope: ['user:write'] }
            },
            validate: {
                params: {
                    id: Joi.number().required().description('User ID')
                },
                payload: Joi.object().description('Generic user data')
            },
            response: createResponseConfig({
                schema: Joi.object({
                    updatedAt: Joi.date()
                }).unknown()
            })
        },
        async handler(request) {
            const { auth, params } = request;
            const userId = params.id;
            await request.server.methods.userIsDeleted(userId);

            if (userId !== auth.artifacts.id) {
                request.server.methods.isAdmin(request, { throwError: true });
            }

            // for setting generic settings
            if (request.payload !== undefined) {
                const keys = Object.keys(request.payload);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    if (/^[a-z0-9_-]+$/.test(key)) {
                        if (request.payload[key] === null) {
                            await UserData.unsetUserData(userId, key);
                        } else {
                            await UserData.setUserData(userId, key, request.payload[key]);
                        }
                    } else {
                        return Boom.badRequest(
                            'user data keys must only contain lowercase letters, numbers, _ and -'
                        );
                    }
                }
            }

            const updatedAt = new Date().toISOString();

            return {
                updatedAt
            };
        }
    });
};
