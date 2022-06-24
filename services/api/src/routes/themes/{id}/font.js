const Joi = require('joi');
const Boom = require('@hapi/boom');
const { Theme } = require('@datawrapper/orm/models');
const stream = require('stream');
const { getCaches, dropCache, themeId } = require('../../../utils/themes');

module.exports = server => {
    const { general } = server.methods.config();
    const themesConfig = general.themes;
    const fileStream = () => Joi.object().instance(stream.Readable);
    const URI = () => Joi.string().uri();

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
                            'font-file-eot': fileStream(),
                            'font-file-woff': fileStream(),
                            'font-file-woff2': fileStream().when('font-file-woff', {
                                not: Joi.exist(),
                                then: Joi.required()
                            }),
                            'font-file-otf': fileStream(),
                            'font-file-ttf': fileStream(),
                            'font-file-svg': fileStream()
                        })
                    })
                    .when(Joi.object({ 'font-upload-method': Joi.valid('url') }).unknown(), {
                        then: Joi.object({
                            'font-url-eot': URI(),
                            'font-url-woff': URI(),
                            'font-url-woff2': URI().when('font-url-woff', {
                                not: Joi.exist(),
                                then: Joi.required()
                            }),
                            'font-url-otf': URI(),
                            'font-url-ttf': URI(),
                            'font-url-svg': URI()
                        })
                    })
                    .when(Joi.object({ 'font-upload-method': Joi.valid('import') }).unknown(), {
                        then: Joi.object({
                            'font-import-url': URI().required()
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

            const formats = ['eot', 'woff', 'woff2', 'ttf', 'svg', 'otf'];
            const method = payload['font-upload-method'];
            const urls = {};
            if (method === 'file') {
                const { prefix, hostname, protocol } = themesConfig.s3;
                const uploads = formats
                    .filter(format => payload[`font-file-${format}`])
                    .map(format => {
                        const file = payload[`font-file-${format}`];
                        const origName = file.hapi.filename;
                        const key = `${prefix}/${theme.id}/${origName}`;
                        urls[format] = `${protocol ? `${protocol}:` : ''}//${hostname}/${key}`;
                        return streamToS3(key, file);
                    });
                await Promise.all(uploads);
            } else if (method === 'url') {
                formats.forEach(format => {
                    if (!payload[`font-url-${format}`]) return;
                    urls[format] = payload[`font-url-${format}`];
                });
            } else if (method === 'import') {
                urls.import = payload['font-import-url'];
            }

            // register with theme
            await theme.addAssetFont(payload['font-name'], method, urls);

            const { themeCache } = getCaches(server);

            await dropCache({
                theme,
                themeCache,
                visualizations: server.app.visualizations
            });

            return {
                urls
            };
        }
    });
};
