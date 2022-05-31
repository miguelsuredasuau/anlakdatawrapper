const got = require('got');

function createAPI(server) {
    const config = server.methods.config('api');
    const apiBase = `${config.https ? 'https' : 'http'}://${config.subdomain}.${config.domain}/v3`;
    const { sessionID } = config;

    return function createAPI(request) {
        let session;
        if (request) {
            const { auth } = request;
            session = auth.credentials?.data?.id || '';
        }
        const csrfToken = 'frontend';
        return async function api(path, { json = true, method = 'GET', body = undefined } = {}) {
            if (!session) {
                // create guest session
                const res = JSON.parse((await got.post(`${apiBase}/auth/session`)).body);
                session = res['DW-SESSION'];
            }
            const response = await got(`${apiBase}${path}`, {
                headers: session
                    ? {
                          Cookie: `${sessionID}=${session};crumb=${csrfToken}`,
                          'X-CSRF-Token': csrfToken
                      }
                    : undefined,

                method: method,
                body
            });

            return json ? JSON.parse(response.body) : response.body;
        };
    };
}

async function waitForAPI(server) {
    const config = server.methods.config('api');
    const apiBase = `${config.https ? 'https' : 'http'}://${config.subdomain}.${config.domain}/v3`;

    try {
        await got.get(apiBase);
    } catch (error) {
        server.logger.info('API not ready, trying again in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await waitForAPI(server);
    }
}

module.exports = { createAPI, waitForAPI };
