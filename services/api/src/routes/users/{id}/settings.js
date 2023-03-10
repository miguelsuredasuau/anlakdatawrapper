const { Team, UserData } = require('@datawrapper/orm/db');
const Boom = require('@hapi/boom');
const Joi = require('joi');

const { createResponseConfig } = require('../../../utils/schemas');

module.exports = async server => {
    // PATCH /v3/users/:id/settings
    server.route({
        method: 'PATCH',
        path: '/settings',
        options: {
            tags: ['api'],
            description: 'Update user settings',
            notes: `Requires scope \`user:write\`.`,
            auth: {
                access: { scope: ['user:write'] }
            },
            validate: {
                params: {
                    id: Joi.number().required().description('User ID')
                },
                payload: {
                    activeTeam: Joi.string()
                        .allow(null)
                        .example('teamxyz')
                        .description('The active team for the user')
                }
            },
            response: createResponseConfig({
                schema: Joi.object({
                    activeTeam: Joi.string().allow(null),
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

            const result = {};

            if (request.payload.activeTeam !== undefined) {
                let teamId = '%none%';
                if (request.payload.activeTeam !== null) {
                    const team = await Team.findByPk(request.payload.activeTeam);
                    if (team) teamId = team.id;
                    else return Boom.notFound('there is no team with that id');
                }

                await UserData.setUserData(userId, 'active_team', teamId);
                result.activeTeam = teamId !== '%none%' ? teamId : null;
            }

            const updatedAt = new Date().toISOString();

            return {
                ...result,
                updatedAt
            };
        }
    });
};
