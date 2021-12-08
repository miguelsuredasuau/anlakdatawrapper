const Joi = require('joi');
const Boom = require('@hapi/boom');
const { Theme } = require('@datawrapper/orm/models');
const stream = require('stream');
const { themeId } = require('../utils');

module.exports = server => {
    const { general } = server.methods.config();
    const themesConfig = general.themes;
    const requiredFileStream = () => Joi.object().instance(stream.Readable).required();
    const requiredURI = () => Joi.string().uri().required();

    // Upload theme font
    // POST /v3/themes/{id}/font
    server.route({
        path: '/font',
        method: 'POST',
        options: {
            auth: 'admin',
            payload: {
                maxBytes: 10240 * 1024, // 10MiB
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
                    'font-name': Joi.string().required(),
                    'font-upload-method': Joi.string().required().valid('file', 'url', 'import')
                })
                    .when(Joi.object({ 'font-upload-method': Joi.valid('file') }).unknown(), {
                        then: Joi.object({
                            'font-file-eot': requiredFileStream(),
                            'font-file-woff': requiredFileStream(),
                            'font-file-woff2': requiredFileStream(),
                            'font-file-ttf': requiredFileStream(),
                            'font-file-svg': requiredFileStream()
                        })
                    })
                    .when(Joi.object({ 'font-upload-method': Joi.valid('url') }).unknown(), {
                        then: Joi.object({
                            'font-url-eot': requiredURI(),
                            'font-url-woff': requiredURI(),
                            'font-url-woff2': requiredURI(),
                            'font-url-ttf': requiredURI(),
                            'font-url-svg': requiredURI()
                        })
                    })
                    .when(Joi.object({ 'font-upload-method': Joi.valid('import') }).unknown(), {
                        then: Joi.object({
                            'font-import-url': requiredURI()
                        })
                    })
            }
        },
        async handler(request) {
            const { params, payload } = request;
            const theme = await Theme.findByPk(params.id);
            if (!theme) return Boom.notFound();

            const streamToS3 = request.server.methods.streamToThemesS3;
            if (!streamToS3) return Boom.notImplemented('no s3 config found');

            const formats = ['eot', 'woff', 'woff2', 'ttf', 'svg'];
            const method = payload['font-upload-method'];
            const urls = {};
            if (method === 'file') {
                const uploads = formats.map(format => {
                    const file = payload[`font-file-${format}`];
                    const origName = file.hapi.filename;
                    const key = `${themesConfig.s3.prefix}/${theme.id}/${origName}`;
                    urls[format] = `//${themesConfig.s3.hostname}/${key}`;
                    return streamToS3(key, file);
                });
                await Promise.all(uploads);
            } else if (method === 'url') {
                formats.forEach(format => {
                    urls[format] = payload[`font-url-${format}`];
                });
            } else if (method === 'import') {
                urls.import = payload['font-import-url'];
            }

            // register with theme
            await theme.addAssetFont(payload['font-name'], method, urls);

            return {
                urls
            };
        }
    });
};
