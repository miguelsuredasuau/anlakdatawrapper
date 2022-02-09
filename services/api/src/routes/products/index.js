const Joi = require('joi');
const { Product } = require('@datawrapper/orm/models');
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
    }
};
