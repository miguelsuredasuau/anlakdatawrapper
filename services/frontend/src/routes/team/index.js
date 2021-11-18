module.exports = {
    name: 'routes/team/index',
    version: '1.0.0',
    register: async server => {
        await server.register(require('./{teamId}/settings.js'));
        await server.register(require('./{teamId}/invite/{token}/accept.js'));
        await server.register(require('./{teamId}/invite/{token}/reject.js'));
    }
};
