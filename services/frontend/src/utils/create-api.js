const got = require('got');

module.exports = function (server) {
    const config = server.methods.config('api');
    const apiBase = `${config.https ? 'https' : 'http'}://${config.subdomain}.${config.domain}/v3`;
    const { sessionID } = config;

    return function createAPI(request) {
        const { auth } = request;
        const session = auth.credentials?.data?.id || '';
        const csrfToken = 'frontend';
        return async function api(path, { json = true, method = 'GET' } = {}) {
            const response = await got(`${apiBase}${path}`, {
                headers: session
                    ? {
                          Cookie: `${sessionID}=${session};crumb=${csrfToken}`,
                          'X-CSRF-Token': csrfToken
                      }
                    : undefined,

                method: method
            });

            return json ? JSON.parse(response.body) : response.body;
        };
    };
};
