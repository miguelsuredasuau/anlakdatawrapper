const Joi = require('joi');

module.exports = {
    name: 'routes/archive',
    version: '1.0.0',
    register: async server => {
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
            const { folderId } = request.params;

            return h.view('archive/Index.svelte', {
                htmlClass: 'has-background-white-bis',
                props: {
                    folder: folderId ? await Folder.findByPk(folderId) : null
                }
            });
        }
    }
};
