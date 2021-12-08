const Joi = require('joi');
const Boom = require('@hapi/boom');
const { Theme } = require('@datawrapper/orm/models');
const stream = require('stream');
const { themeId } = require('../utils');

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
            const key = `${themesConfig.s3.prefix}/${theme.id}/${origName}`;
            const publicUrl = `${themesConfig.s3.protocol}://${themesConfig.s3.hostname}/${key}`;
            await streamToS3(key, file);

            // register with theme
            await theme.addAssetFile(origName, publicUrl);

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
