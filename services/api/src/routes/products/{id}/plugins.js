const Boom = require('@hapi/boom');
const Joi = require('joi');
const { Product, ProductPlugin } = require('@datawrapper/orm/db');
const { SQ } = require('@datawrapper/orm');
const { Op } = SQ;

module.exports = {
    name: 'routes/products/{id}/plugins',
    version: '1.0.0',
    register: server => {
        server.app.adminScopes.add('product:read');
        server.app.adminScopes.add('product:write');

        server.route({
            method: 'DELETE',
            path: '/{id}/plugins',
            options: {
                auth: {
                    strategy: 'admin',
                    access: { scope: ['product:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().required().description('ID of the product to modify')
                    }),
                    payload: Joi.array()
                        .items(Joi.string())
                        .required()
                        .description('IDs of the plugins to remove from the product')
                }
            },

            async handler(request, h) {
                const { params, server, payload } = request;

                server.methods.isAdmin(request, { throwError: true });

                const product = await Product.findByPk(params.id);
                if (!product) {
                    return Boom.notFound('Product not found');
                }

                const pluginIds = payload.map(pluginId => ({ pluginId }));
                await ProductPlugin.destroy({
                    where: {
                        productId: params.id,
                        [Op.or]: pluginIds
                    }
                });

                return h.response().code(204);
            }
        });

        server.route({
            method: 'POST',
            path: '/{id}/plugins',
            options: {
                auth: {
                    strategy: 'admin',
                    access: { scope: ['product:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().required().description('ID of the product to modify')
                    }),
                    payload: Joi.array()
                        .items(Joi.string())
                        .required()
                        .description('IDs of the plugins to add to the product')
                }
            },

            async handler(request, h) {
                const { params, server, payload } = request;

                server.methods.isAdmin(request, { throwError: true });

                const product = await Product.findByPk(params.id);
                if (!product) {
                    return Boom.notFound('Product not found');
                }

                const entries = payload.map(pluginId => ({ pluginId, productId: product.id }));
                await ProductPlugin.bulkCreate(entries);

                return h.response().code(201);
            }
        });
    }
};
