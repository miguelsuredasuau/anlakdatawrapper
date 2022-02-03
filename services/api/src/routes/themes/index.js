const Joi = require('joi');
const Boom = require('@hapi/boom');
const S3 = require('aws-sdk/clients/s3');
const stream = require('stream');
const { themeId, validateThemeData, validateThemeLess } = require('./utils');
const { Theme, TeamTheme } = require('@datawrapper/orm/models');
const { listResponse } = require('../../schemas/response');

module.exports = {
    name: 'routes/themes',
    version: '1.0.0',
    register: server => {
        const config = server.methods.config();

        server.app.scopes.add('theme:read');

        let streamToS3;
        const themesConfig = config.general.themes;
        if (themesConfig?.s3 && themesConfig.s3.bucket) {
            const s3Config = {
                apiVersion: '2006-03-01',
                accessKeyId: themesConfig.s3.accessKeyId,
                secretAccessKey: themesConfig.s3.secretAccessKey,
                // Needed for minio compatibility:
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            };
            if (themesConfig.s3.endpoint) {
                s3Config.endpoint = themesConfig.s3.endpoint;
            }
            if (themesConfig.s3.region) {
                s3Config.region = themesConfig.s3.region;
            }
            const s3 = new S3(s3Config);
            streamToS3 = async (key, inputStream) => {
                const origName = inputStream.hapi.filename;
                const mimeType = inputStream.hapi.headers['content-type'];
                // create s3 write stream
                const uploadStream = new stream.PassThrough();
                const promise = s3
                    .upload({
                        CacheControl: 'max-age=21600',
                        Bucket: themesConfig.s3.bucket,
                        Key: key,
                        ACL: 'public-read',
                        Body: uploadStream,
                        ContentType: origName.endsWith('.svg') ? 'image/svg+xml' : mimeType
                    })
                    .promise();

                /// stream file to s3
                inputStream.pipe(uploadStream);
                await promise;
            };
        } else {
            server.logger.warn("S3 not configured, some api routes won't work");
            streamToS3 = () => server.logger.warn("S3 not configured, can't upload data");
        }
        server.method('streamToThemesS3', streamToS3);

        // Register the API endpoints
        server.route({
            path: '/',
            method: 'GET',
            options: {
                tags: ['api'],
                description: 'List themes',
                auth: {
                    access: { scope: ['theme:read'] }
                },
                notes: `Get a list of themes accessible by the authenticated user
                (either directly or through the current active team.)
                        The returned theme objects do not include the full theme configuration.
                        Requires scope \`chart:read\`.`,
                validate: {
                    query: {
                        limit: Joi.number()
                            .integer()
                            .min(0)
                            .default(100)
                            .description('Maximum items to fetch. Useful for pagination.'),
                        offset: Joi.number()
                            .integer()
                            .min(0)
                            .default(0)
                            .description('Number of items to skip. Useful for pagination.')
                    }
                },
                response: listResponse
            },
            async handler(request) {
                const wantedThemeIds = [];
                let withDefaultThemes = true;

                const { auth } = request;
                const activeTeam = await auth.artifacts.getActiveTeam();
                if (activeTeam) {
                    const { rows } = await TeamTheme.findAndCountAll({
                        attributes: ['theme_id'],
                        where: {
                            organization_id: activeTeam.id
                        }
                    });
                    wantedThemeIds.push(...rows.map(el => el['theme_id']));
                    withDefaultThemes = !activeTeam.settings.restrictDefaultThemes;
                }
                if (withDefaultThemes) {
                    wantedThemeIds.push(...request.server.methods.config('general.defaultThemes'));
                }
                const uniqueIds = wantedThemeIds.filter(onlyUnique);
                const themes = await Theme.findAll({
                    where: {
                        id: uniqueIds
                    },
                    order: [['title', 'ASC']],
                    offset: request.query.offset,
                    limit: request.query.limit
                });
                return {
                    total: uniqueIds.length,
                    list: themes.map(cleanTheme)
                };
            }
        });

        // create theme
        server.route({
            path: '/',
            method: 'POST',
            options: {
                auth: 'admin',
                validate: {
                    payload: Joi.object({
                        id: themeId().required(),
                        title: Joi.string(),
                        extend: themeId(),
                        data: Joi.object().default({}),
                        assets: Joi.object().default({}),
                        less: Joi.string()
                    })
                }
            },
            async handler(request, h) {
                const { payload } = request;
                if (await Theme.findByPk(payload.id)) {
                    return Boom.conflict();
                }

                await validateThemeLess(payload.less);
                await validateThemeData(payload.data, server);

                const theme = await Theme.create({
                    id: payload.id,
                    title: payload.title,
                    extend: payload.extend,
                    data: payload.data,
                    assets: payload.assets,
                    less: payload.less
                });

                return h
                    .response({
                        ...theme.toJSON(),
                        url: `themes/${theme.id}`
                    })
                    .code(201);
            }
        });

        server.register(require('./{id}'), {
            routes: {
                prefix: '/{id}'
            }
        });

        function cleanTheme(theme) {
            return {
                id: theme.id,
                title: theme.title,
                createdAt: theme.createdAt
            };
        }

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
    }
};
