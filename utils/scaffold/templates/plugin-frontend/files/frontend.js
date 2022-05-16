const { name, version } = require('./package.json');

module.exports = {
    name,
    version,
    register: server => {
        // add a new frontend server route
        server.route({
            method: 'GET',
            path: '/v2/hello-world',
            async handler(request, h) {
                const props = { name: 'Foobar' };
                return h.view('plugins/my-new-plugin/HelloWorld.svelte', { props });
            }
        });

        // pre-compile Svelte view on frontend server statup
        server.methods.registerView('plugins/my-new-plugin/HelloWorld.svelte');
    }
};
