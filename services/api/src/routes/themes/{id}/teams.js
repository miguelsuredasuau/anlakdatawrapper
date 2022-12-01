const Joi = require('joi');
const Boom = require('@hapi/boom');
const { SQ } = require('@datawrapper/orm');
const { Op } = SQ;
const { Theme, Team } = require('@datawrapper/orm/db');
const { themeId } = require('../../../utils/themes');

module.exports = server => {
    // Grant theme access to teams
    // POST /v3/themes/{id}/teams
    server.route({
        path: '/teams',
        method: 'POST',
        options: {
            auth: 'admin',
            validate: {
                params: Joi.object({
                    id: themeId()
                }),
                payload: Joi.array().items(Joi.string().required())
            }
        },
        async handler(request, h) {
            const { params, payload } = request;
            const theme = await Theme.findByPk(params.id, {
                include: [Team]
            });
            if (!theme) return Boom.notFound();

            const teams = await Team.findAll({
                where: {
                    id: {
                        [Op.in]: payload
                    }
                }
            });
            await theme.addTeams(teams);

            return h
                .response({
                    teams: teams.map(t => t.serialize())
                })
                .code(201);
        }
    });

    // Remove theme access from teams
    // DELETE /v3/themes/{id}/teams
    server.route({
        path: '/teams',
        method: 'DELETE',
        options: {
            auth: 'admin',
            validate: {
                params: Joi.object({
                    id: themeId()
                }),
                payload: Joi.array().items(Joi.string().required())
            }
        },
        async handler(request, h) {
            const { params, payload } = request;
            const theme = await Theme.findByPk(params.id);
            if (!theme) return Boom.notFound();

            const teams = await Team.findAll({
                where: {
                    id: {
                        [Op.in]: payload
                    }
                }
            });
            await theme.removeTeams(teams);

            return h
                .response({
                    teams: teams.map(t => t.serialize())
                })
                .code(201);
        }
    });
};
