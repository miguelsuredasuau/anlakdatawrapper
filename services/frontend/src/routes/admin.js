const Joi = require('joi');

module.exports = {
    name: 'routes/admin',
    version: '1.0.0',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/{pageId?}',
            options: {
                auth: 'admin',
                validate: {
                    params: Joi.object({
                        pageId: Joi.string()
                    })
                },
                async handler(request, h) {
                    const settingsPages = await server.methods.getSettingsPages(
                        'admin',
                        request,
                        page => page.svelte2 || page.view
                    );

                    return h.view('admin/Index.svelte', {
                        htmlClass: 'has-background-white-bis',
                        props: {
                            settingsPages
                        }
                    });
                }
            }
        });
    }
};
