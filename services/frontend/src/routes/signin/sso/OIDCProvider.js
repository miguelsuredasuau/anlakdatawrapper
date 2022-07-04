const Boom = require('@hapi/boom');
const { generators, Issuer } = require('openid-client');
const get = require('lodash/get');

class OIDCProvider {
    constructor(server, teamId, client) {
        this.server = server;
        this.teamId = teamId;
        this.client = client;
    }

    static async create(server, settings, teamId) {
        const enabled = get(settings, 'enabled');
        const domain = get(settings, 'openId.domain');

        if (!enabled || !domain) throw Boom.badRequest('OpenID not configured');

        let issuer = null;

        try {
            issuer = await Issuer.discover(
                domain.startsWith('https') ? domain : `https://${domain}`
            );
        } catch (ex) {
            server.logger.warn('Could not find OpenID configuration', ex.message);
            throw Boom.badRequest('Could not find OpenID configuration for configured endpoint.');
        }

        const client = new issuer.Client({
            client_id: get(settings, 'openId.clientId'),
            client_secret: get(settings, 'openId.clientSecret')
        });

        return new OIDCProvider(server, teamId, client);
    }

    async generateLoginUrl(token) {
        if (!this.client) await this.initialize();
        const nonce = generators.nonce();
        const frontend = this.server.methods.config('frontend');

        const redirectUrl = this.client.authorizationUrl({
            redirect_uri: `${frontend.https ? 'https' : 'http'}://${frontend.domain}/signin/sso`,
            scope: 'openid email profile',
            response_mode: 'form_post',
            state: JSON.stringify({ team: this.teamId, ...{ token } }),
            nonce
        });

        return {
            redirectUrl,
            nonce
        };
    }

    async validateCallback(request) {
        if (!this.client) await this.initialize();
        const nonce = request.state['sso-nonce'];
        const frontend = this.server.methods.config('frontend');

        try {
            const res = await this.client.callback(
                `${frontend.https ? 'https' : 'http'}://${frontend.domain}/signin/sso`,
                request.payload,
                { nonce, state: request.payload.state }
            );
            const profile = res.claims();

            return {
                oAuthSignin: `sso::${this.teamId}/${profile.sub}`,
                email: profile.email
            };
        } catch (ex) {
            this.server.logger.error('Unsuccessful OpenID callback');
            this.server.logger.error(ex);
            throw Boom.unauthorized();
        }
    }
}

module.exports = OIDCProvider;
