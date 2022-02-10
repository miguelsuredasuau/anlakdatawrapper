const Boom = require('@hapi/boom');
const Joi = require('joi');
const { Product, ProductPlugin } = require('@datawrapper/orm/models');

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
                        id: Joi.string().required().description('ID of the product to delete.')
                    }),
                    payload: Joi.array().items(Joi.string())
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
                const { Op } = server.methods.getDB();
                await ProductPlugin.destroy({
                    where: {
                        productId: params.id,
                        [Op.or]: pluginIds
                    }
                });

                return h.response().code(204);
            }
        });
    }
};
