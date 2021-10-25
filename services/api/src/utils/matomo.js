const got = require('got');

module.exports = {
    name: 'utils/matomo',
    version: '1.0.0',
    register: async server => {
        const config = server.methods.config('api');
        const apiDomain = `http${config.https ? 's' : ''}://${config.subdomain}.${config.domain}`;
        const matomo = got.extend({
            url: config.matomo.endpoint
        });
        server.ext('onPostResponse', async request => {
            setTimeout(() => {
                try {
                    matomo.post({
                        searchParams: new URLSearchParams([
                            ['idsite', config.matomo.idsite],
                            ['rec', '1'],
                            ['url', request.url.href.replace(request.url.origin, apiDomain)],
                            ['uid', request.auth?.artifacts?.id],
                            ['rand', Math.random()],
                            ['apiv', 1]
                        ]),
                        headers: {
                            // pass on IP to matomo
                            HTTP_X_FORWARDED_FOR: request.headers.HTTP_X_FORWARDED_FOR
                        }
                    });
                    // eslint-disable-next-line
                } catch (err) {}
            });
            return;
        });
    }
};
