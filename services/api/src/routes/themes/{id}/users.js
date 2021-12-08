const Joi = require('joi');
const Boom = require('@hapi/boom');
const { Theme, User, Team } = require('@datawrapper/orm/models');
const { themeId } = require('../utils');

module.exports = server => {
    // Grant theme access users
    // POST /v3/themes/{id}/users
    server.route({
        path: '/users',
        method: 'POST',
        options: {
            auth: 'admin',
            validate: {
                params: Joi.object({
                    id: themeId()
                }),
                payload: Joi.array().items(Joi.number().required())
            }
        },
        async handler(request, h) {
            const { params, payload } = request;
            const theme = await Theme.findByPk(params.id, {
                include: [User, Team]
            });
            if (!theme) return Boom.notFound();

            const { Op } = User.sequelize;

            const users = await User.findAll({
                where: {
                    id: {
                        [Op.in]: payload
                    },
                    deleted: 0
                }
            });
            await theme.addUsers(users);

            return h
                .response({
                    users: users.map(u => u.serialize())
                })
                .code(201);
        }
    });

    // Remove theme access from users
    // DELETE /v3/themes/{id}/users
    server.route({
        path: '/users',
        method: 'DELETE',
        options: {
            auth: 'admin',
            validate: {
                params: Joi.object({
                    id: themeId()
                }),
                payload: Joi.array().items(Joi.number().required())
            }
        },
        async handler(request, h) {
            const { params, payload } = request;
            const theme = await Theme.findByPk(params.id);
            if (!theme) return Boom.notFound();

            const { Op } = User.sequelize;

            const users = await User.findAll({
                where: {
                    id: {
                        [Op.in]: payload
                    }
                }
            });
            await theme.removeUsers(users);

            return h
                .response({
                    users: users.map(u => u.serialize())
                })
                .code(200);
        }
    });
};
