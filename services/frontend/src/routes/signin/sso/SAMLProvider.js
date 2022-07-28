const Boom = require('@hapi/boom');
const Joi = require('joi');
const Saml = require('passport-saml/lib/node-saml');
const get = require('lodash/get');

class SAMLProvider {
    constructor(server, teamId, client) {
        this.server = server;
        this.teamId = teamId;
        this.client = client;
    }

    static async create(server, settings, teamId) {
        const frontend = server.methods.config('frontend');
        const enabled = get(settings, 'enabled');
        const { url, certificate, disableRequestedAuthnContext } = get(settings, 'saml', {});

        if (!enabled || !url || !certificate) throw Boom.badRequest('SAML not configured');

        const baseUri = `${frontend.https ? 'https' : 'http'}://${frontend.domain}`;

        const client = new Saml.SAML({
            callbackUrl: `${baseUri}/signin/sso`,
            issuer: `${baseUri}/sp`,
            disableRequestedAuthnContext,
            entryPoint: url,
            cert: certificate
        });

        return new SAMLProvider(server, teamId, client);
    }

    async generateLoginUrl(token) {
        return {
            redirectUrl: await this.client.getAuthorizeUrlAsync(
                JSON.stringify({
                    team: this.teamId,
                    ...{ token }
                })
            )
        };
    }

    async validateCallback(request) {
        const { SAMLResponse } = request.payload;

        try {
            const res = await this.client.validatePostResponseAsync({ SAMLResponse });
            const oAuthSignin = `sso::${this.teamId}/${res.profile.nameID}`;
            const isEmail = !Joi.string().email().validate(res.profile.nameID).error;

            return {
                oAuthSignin,
                ...{ email: isEmail ? res.profile.nameID : undefined }
            };
        } catch (ex) {
            this.server.logger.error('Unsuccessful SAML callback');
            this.server.logger.error(ex);
            throw Boom.unauthorized();
        }
    }
}

module.exports = SAMLProvider;
