module.exports = {
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
    }
};
