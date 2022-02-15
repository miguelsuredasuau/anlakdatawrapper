const Boom = require('@hapi/boom');
const flatten = require('lodash/flatten');

module.exports = {
    name: 'routes/admin',
    version: '1.0.0',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/{page*}',
            options: {
                auth: 'admin',
                validate: {},
                async handler(request, h) {
                    const settingsPages = await server.methods.getSettingsPages(
                        'admin',
                        request,
                        page => page.isBoom || page.svelte2 || page.view
                    );

                    const flatPageList = flatten(settingsPages.map(d => d.pages));

                    // check if any of the pages returned a Boom error...
                    const errorPage = flatPageList.find(page => Boom.isBoom(page));
                    // ...and return it to see the error page
                    if (errorPage) {
                        return errorPage;
                    }

                    // check that at least one admin page matches the request url
                    if (
                        !flatPageList.find(page =>
                            page.pathRegex
                                ? new RegExp(page.pathRegex).test(request.url.pathname)
                                : page.url === request.url.pathname
                        )
                    ) {
                        return Boom.notFound();
                    }

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
