const Joi = require('joi');
const Boom = require('@hapi/boom');
const { Theme } = require('@datawrapper/orm/models');
const stream = require('stream');
const { getCaches, dropCache, themeId } = require('../../../utils/themes');

module.exports = server => {
    const config = server.methods.config();
    const themesConfig = config.general.themes;
    const requiredFileStream = () => Joi.object().instance(stream.Readable).required();

    // Upload theme assets
    // POST /v3/themes/{id}/asset
    server.route({
        path: '/asset',
        method: 'POST',
        options: {
            auth: 'admin',
            payload: {
                maxBytes: 10240 * 1024, // 10MiB,
                multipart: true,
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            },
            validate: {
                params: Joi.object({
                    id: themeId()
                }),
                payload: Joi.object({
                    'asset-file': requiredFileStream()
                })
            }
        },
        async handler(request) {
            const { params, payload } = request;
            const theme = await Theme.findByPk(params.id);
            if (!theme) return Boom.notFound();

            const streamToS3 = request.server.methods.streamToThemesS3;
            if (!streamToS3) return Boom.notImplemented('no s3 config found');

            const file = payload['asset-file'];

            if (!file) return Boom.badRequest('no file found');

            const origName = file.hapi.filename;

            // s3 upload
            const { prefix, hostname, protocol } = themesConfig.s3;
            const key = `${prefix}/${theme.id}/${origName}`;
            const publicUrl = `${protocol ? `${protocol}:` : ''}//${hostname}/${key}`;
            await streamToS3(key, file);

            // register with theme
            await theme.addAssetFile(origName, publicUrl);

            const { themeCache, githeadCache } = getCaches(server);
            await dropCache({
                theme,
                themeCache,
                githeadCache,
                visualizations: server.app.visualizations
            });

            return {
                url: publicUrl
            };
        }
    });
    // Delete asset
    // DELETE /v3/themes/{id}/asset
    server.route({
        path: '/asset',
        method: 'DELETE',
        options: {
            auth: 'admin',
            validate: {
                params: Joi.object({
                    id: themeId()
                }),
                payload: Joi.object({
                    name: Joi.string().required()
                })
            }
        },
        async handler(request, h) {
            const { params, payload } = request;
            const theme = await Theme.findByPk(params.id);
            if (!theme) return Boom.notFound();

            await theme.removeAsset(payload.name);
            return h.response().code(204);
        }
    });
};
