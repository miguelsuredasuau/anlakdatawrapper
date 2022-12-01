const Joi = require('joi');
const { Product } = require('@datawrapper/orm/db');
const { listResponse } = require('../../utils/schemas');
const { serializeProduct } = require('./utils.js');

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
                        name: Joi.string().required().description('Name'),
                        priority: Joi.number().optional().description('Priority'),
                        data: Joi.object().optional().description('Data')
                    })
                }
            },
            async handler(request, h) {
                request.server.methods.isAdmin(request, { throwError: true });

                const { payload } = request;

                const product = await Product.create({
                    name: payload.name,
                    priority: payload.priority,
                    data: JSON.stringify(payload.data)
                });

                return h.response(serializeProduct(product)).code(201);
            }
        });

        server.register(require('./{id}'), {
            routes: {
                prefix: '/{id}'
            }
        });

        server.register(require('./{id}/plugins'));
    }
};
