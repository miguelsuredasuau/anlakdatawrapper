const Joi = require('joi');

module.exports = {
    name: 'routes/archive',
    version: '1.0.0',
    register: async server => {
        const config = server.methods.config();
        const { createAPI } = require('./preview/utils');
        const apiBase = `${config.api.https ? 'https' : 'http'}://${config.api.subdomain}.${
            config.api.domain
        }/v3`;
        server.methods.prepareView('archive/Index.svelte');
        const Folder = server.methods.getModel('folder');

        server.route({
            method: 'GET',
            path: '/{folderId?}',
            options: {
                auth: 'user',
                validate: {
                    params: Joi.object({
                        folderId: Joi.number().integer().optional()
                    })
                },
                handler: visArchiveHandler
            }
        });

        server.route({
            method: 'GET',
            path: '/team/{teamId}/{folderId?}',
            options: {
                auth: 'user',
                validate: {
                    params: Joi.object({
                        teamId: Joi.string().required(),
                        folderId: Joi.number().integer().optional()
                    })
                },
                handler: visArchiveHandler
            }
        });

        async function visArchiveHandler(request, h) {
            const { auth, params } = request;
            const { teamId, folderId } = params;

            const api = createAPI(
                apiBase,
                config.api.sessionID,
                auth.credentials && auth.credentials.data ? auth.credentials.data.id : ''
            );

            const offset = 0;
            const limit = 15;

            const charts = await api(
                `/charts?minLastEditStep=2&offset=${offset}&limit=${limit}&folderId=${
                    folderId ? folderId : 'null'
                }${teamId ? `&teamId=${teamId}` : ''}`
            );

            return h.view('archive/Index.svelte', {
                htmlClass: 'has-background-white-bis',
                props: {
                    charts,
                    limit,
                    offset,
                    folderId,
                    teamId,
                    folder: folderId ? await Folder.findByPk(folderId) : null
                }
            });
        }
    }
};
