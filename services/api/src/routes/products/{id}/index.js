const Boom = require('@hapi/boom');
const Joi = require('joi');
const { Product, Team, User } = require('@datawrapper/orm/models');
const { serializeProduct } = require('../utils.js');

module.exports = {
    name: 'routes/products/{id}',
    version: '1.0.0',
    register: server => {
        server.app.adminScopes.add('product:read');
        server.app.adminScopes.add('product:write');

        server.route({
            method: 'PUT',
            path: '/',
            options: {
                auth: {
                    strategy: 'admin',
                    access: { scope: ['product:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().required().description('ID of the product to update.')
                    }),
                    payload: Joi.object({
                        name: Joi.string().required().description('Name'),
                        priority: Joi.number().required().description('Priority'),
                        data: Joi.object().required().description('Data')
                    })
                }
            },
            async handler(request) {
                request.server.methods.isAdmin(request, { throwError: true });

                const product = await Product.findByPk(request.params.id);
                if (!product) {
                    return Boom.notFound("Can't access this product. Folder may not exist.");
                }

                const { payload } = request;

                product.name = payload.name;
                product.priority = payload.priority;
                product.data = JSON.stringify(payload.data);
                await product.save();

                return serializeProduct(product);
            }
        });

        server.route({
            method: 'DELETE',
            path: '/',
            options: {
                auth: {
                    strategy: 'admin',
                    access: { scope: ['product:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().required().description('ID of the product to delete.')
                    })
                }
            },
            async handler(request, h) {
                const { params, server } = request;

                server.methods.isAdmin(request, { throwError: true });

                const product = await Product.findByPk(params.id, {
                    include: [
                        {
                            model: Team,
                            through: { attributes: ['expires'] }
                        },
                        {
                            model: User,
                            through: { attributes: ['expires'] }
                        }
                    ]
                });

                if (!product) {
                    return Boom.notFound('Product not found');
                }

                const activeTeams = product.teams.filter(({ dataValues }) => {
                    const expiryDate = dataValues.team_product.expires;
                    return !expiryDate || Date.parse(expiryDate) > Date.now();
                });

                const activeUsers = product.users.filter(({ dataValues }) => {
                    const expiryDate = dataValues.user_product.expires;
                    return !expiryDate || Date.parse(expiryDate) > Date.now();
                });

                if (activeTeams.length || activeUsers.length) {
                    return Boom.forbidden('Product is still in use');
                }

                await product.update({ deleted: true });

                return h.response().code(204);
            }
        });
    }
};
