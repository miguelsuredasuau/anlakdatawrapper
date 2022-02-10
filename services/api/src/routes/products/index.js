const Joi = require('joi');
const Boom = require('@hapi/boom');
const { Product, User, Team } = require('@datawrapper/orm/models');
const { listResponse } = require('../../schemas/response');

function validateJSON(value) {
    JSON.parse(value);
    return value;
}

function serializeProduct(product) {
    return {
        id: product.id,
        name: product.name,
        deleted: product.deleted,
        priority: product.priority,
        data: product.data && JSON.parse(product.data),
        createdAt: product.createdAt
    };
}

module.exports = {
    name: 'routes/products',
    version: '1.0.0',
    register: server => {
        server.app.adminScopes.add('product:read');
        server.app.adminScopes.add('product:write');

        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: {
                    strategy: 'admin',
                    access: { scope: ['product:read'] }
                },
                response: listResponse
            },
            async handler(request) {
                request.server.methods.isAdmin(request, { throwError: true });

                const { rows, count } = await Product.findAndCountAll({
                    where: {
                        deleted: false
                    }
                });

                return {
                    list: rows.map(serializeProduct),
                    total: count
                };
            }
        });

        server.route({
            method: 'POST',
            path: '/',
            options: {
                auth: {
                    strategy: 'admin',
                    access: { scope: ['product:write'] }
                },
                validate: {
                    payload: Joi.object({
                        name: Joi.string().required().description('Product name'),
                        priority: Joi.number().optional().description('Priority'),
                        data: Joi.string()
                            .optional()
                            .custom(validateJSON)
                            .description('Product data as a JSON string')
                    })
                }
            },
            async handler(request, h) {
                request.server.methods.isAdmin(request, { throwError: true });

                const { payload } = request;

                const product = await Product.create({
                    name: payload.name,
                    priority: payload.priority,
                    data: payload.data
                });

                return h.response(serializeProduct(product)).code(201);
            }
        });

        server.route({
            method: 'DELETE',
            path: '/{id}',
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
