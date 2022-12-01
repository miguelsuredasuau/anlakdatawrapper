const { createAuth } = require('@datawrapper/service-utils');
const { AccessToken, User, Session, Chart, Team } = require('@datawrapper/orm/db');
const { createSession, getStateOpts } = createAuth({ AccessToken, User, Session, Chart, Team });

module.exports = async server => {
    // POST /v3/auth/session
    server.route({
        method: 'POST',
        path: '/session',
        options: {
            auth: {
                mode: 'try',
                strategy: 'guest',
                access: { scope: ['auth:write'] }
            },
            plugins: {
                crumb: false
            }
        },
        async handler(request, h) {
            const { auth, server } = request;

            const api = server.methods.config('api');

            if (auth.credentials && auth.credentials.session) {
                return { [api.sessionID]: auth.credentials.session };
            }

            const session = await createSession(server.methods.generateToken(), undefined, false);

            return h
                .response({
                    [api.sessionID]: session.id
                })
                .state(api.sessionID, session.id, getStateOpts(request.server, 30));
        }
    });
};
