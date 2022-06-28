const get = require('lodash/get');
const got = require('got');

const CSRF_TOKEN = 'frontend';

module.exports = {
    name: 'utils/api',
    version: '1.0.0',
    register: async server => {
        const apiConfig = server.methods.config('api');
        const apiBase = getAPIBase(apiConfig);
        const { sessionID } = apiConfig;

        /**
         * Returns a wrapper around got for making authenticated API requests.
         *
         * @param {object} request - Hapi request object
         * @returns {function}
         *
         * @example
         * const api = server.methods.createAPI(request);
         * const themes = await api('/themes');
         * await api('/charts/12345/data', { method: 'PUT', json: false, body: newCSV });
         */
        server.method('createAPI', request => createAPI(request, apiBase, sessionID));

        /**
         * Returns a Promise that resolves once the API is ready.
         *
         * @returns {Promise}
         */
        server.method('waitForAPI', () => waitForAPI(server, apiBase));
    }
};

function getAPIBase(apiConfig) {
    const scheme = apiConfig.https ? 'https' : 'http';
    const host = apiConfig.subdomain
        ? `${apiConfig.subdomain}.${apiConfig.domain}`
        : apiConfig.domain;
    return `${scheme}://${host}/v3`;
}

function createAPI(request, apiBase, sessionID) {
    const requestSession = get(request, 'auth.credentials.data.id');

    return async function api(path, { json = true, method = 'GET', body = undefined } = {}) {
        const session = requestSession || (await createGuestSession());
        let res;
        try {
            res = await got(`${apiBase}${path}`, {
                headers: session && {
                    Cookie: `${sessionID}=${session};crumb=${CSRF_TOKEN}`,
                    'X-CSRF-Token': CSRF_TOKEN
                },
                method,
                body
            });
        } catch (e) {
            if (e.response) {
                if ([502, 504].includes(e.response.statusCode)) {
                    // Don't send errors caused by an API outage to Sentry, because we are notified
                    // about such errors by StatusCake.
                    request.server.methods.sentryIgnoreCurrentError(request);
                } else {
                    // Send more details about the failed API request to Sentry.
                    request.sentryScope.setExtras({
                        url: e.response.requestUrl,
                        method: e.response.request.options.method,
                        statusCode: e.response.statusCode
                    });
                }
            }
            throw e;
        }
        return json ? JSON.parse(res.body) : res.body;
    };
}

async function createGuestSession(apiBase) {
    const res = JSON.parse((await got.post(`${apiBase}/auth/session`)).body);
    return res['DW-SESSION'];
}

async function waitForAPI(server, apiBase, timeoutSec = 1) {
    try {
        await got.get(apiBase);
    } catch (error) {
        server.logger.info(`API not ready, trying again in ${timeoutSec}s...`);
        await new Promise(resolve => setTimeout(resolve, timeoutSec * 1000));
        await waitForAPI(server, apiBase);
    }
}