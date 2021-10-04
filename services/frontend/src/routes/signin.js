const Boom = require('@hapi/boom');
const Bell = require('@hapi/bell');
const { User, Team, UserTeam } = require('@datawrapper/orm/models');
const { Issuer } = require('openid-client');
const { generators } = require('openid-client');
const get = require('lodash/get');

const { login, getStateOpts } = require('@datawrapper/service-utils/auth')(
    require('@datawrapper/orm/models')
);

module.exports = {
    name: 'routes/signin',
    version: '1.0.0',
    register: async server => {
        const oauth = server.methods.config('general').oauth;
        const frontend = server.methods.config('frontend');
        const api = server.methods.config('api');

        for (var provider in oauth) {
            if (!Object.keys(Bell.providers).includes(provider)) continue;

            server.route({
                method: ['GET', 'POST'],
                path: `/${provider}`,
                options: {
                    auth: {
                        mode: 'try',
                        strategy: provider
                    },
                    handler: async function (request, h) {
                        if (!request.auth.isAuthenticated) {
                            throw Boom.unauthorized();
                        }

                        const { profile } = request.auth.credentials;

                        const oAuthSignin = `${provider}::${profile.id}`;
                        const name = profile.displayName;
                        const email = profile.email;

                        // check if we already have this user id in our database
                        let user = await User.findOne({ where: { oauth_signin: oAuthSignin } });

                        if (!user && email) {
                            // if not, check if that email is already registered
                            user = await User.findOne({ where: { email } });

                            if (user) {
                                // that email already exists, but it is activated?
                                if (user.role !== 'pending') {
                                    // yes, user exists and was activated
                                    user.name = name;
                                    user.oauth_signin = oAuthSignin;
                                } else {
                                    // this was never activated, so ANYONE could have created
                                    // the account. since we now know the real owner, let's
                                    // reset the password to be save that whoever created
                                    // the account in the first place, but didn't activate the
                                    // email, no longer has access!
                                    user.pwd = '';
                                }
                            }
                        } else if (user) {
                            if (user.deleted || user.email === 'DELETED') {
                                user.email = email;
                                user.deleted = false;
                            }
                        }

                        if (user) {
                            await user.save();
                        } else {
                            // create new user

                            user = await User.create({
                                role: 'editor',
                                name,
                                email: email || '',
                                pwd: '',
                                oauth_signin: oAuthSignin
                            });
                        }

                        const session = await login(user.id, request.auth.credentials, true);
                        await request.server.methods.logAction(user.id, `login/${provider}`);

                        return h
                            .response({
                                [api.sessionID]: session.id
                            })
                            .state(api.sessionID, session.id, getStateOpts(request.server, 90))
                            .redirect('/');
                    }
                }
            });
        }

        async function getOpenIdClient(teamId) {
            const team = await Team.findByPk(teamId);
            const enabled = get(team.settings, 'sso.enabled');
            const domain = get(team.settings, 'sso.openId.domain');

            if (!enabled || !domain) throw Boom.badRequest('OpenID not configured');

            let issuer = null;

            try {
                issuer = await Issuer.discover(
                    domain.startsWith('https') ? domain : `https://${domain}`
                );
            } catch (ex) {
                server.logger.warn('Could not find OpenID configuration', ex.message);
                throw Boom.badRequest(
                    'Could not find OpenID configuration for configured endpoint.'
                );
            }

            const client = new issuer.Client({
                client_id: get(team.settings, 'sso.openId.clientId'),
                client_secret: get(team.settings, 'sso.openId.clientSecret')
            });

            return client;
        }

        server.route({
            method: ['GET'],
            path: `/sso/{teamId}`,
            options: {
                auth: {
                    mode: 'try'
                },
                handler: async function (request, h) {
                    const client = await getOpenIdClient(request.params.teamId);
                    const nonce = generators.nonce();

                    const redirectUrl = client.authorizationUrl({
                        redirect_uri: `${frontend.https ? 'https' : 'http'}://${
                            frontend.domain
                        }/signin/sso`,
                        scope: 'openid email profile',
                        response_mode: 'form_post',
                        state: JSON.stringify({ team: request.params.teamId }),
                        nonce
                    });

                    return h
                        .response({})
                        .state('sso-nonce', nonce, getStateOpts(request.server, 90, 'None'))
                        .redirect(redirectUrl);
                }
            }
        });

        server.route({
            method: ['GET'],
            path: `/sso/{teamId}/{token}`,
            options: {
                auth: {
                    mode: 'try'
                },
                handler: async function (request, h) {
                    const client = await getOpenIdClient(request.params.teamId);
                    const nonce = generators.nonce();

                    const redirectUrl = client.authorizationUrl({
                        redirect_uri: `${frontend.https ? 'https' : 'http'}://${
                            frontend.domain
                        }/signin/sso`,
                        scope: 'openid email profile',
                        response_mode: 'form_post',
                        state: JSON.stringify({
                            team: request.params.teamId,
                            token: request.params.token
                        }),
                        nonce
                    });

                    return h
                        .response({})
                        .state('sso-nonce', nonce, getStateOpts(request.server, 90, 'None'))
                        .redirect(redirectUrl);
                }
            }
        });

        server.route({
            method: ['POST'],
            path: `/sso`,
            options: {
                auth: {
                    mode: 'try'
                },
                payload: {
                    output: 'data',
                    parse: true
                },
                handler: async function (request, h) {
                    let user = null;
                    let state = null;

                    try {
                        state = JSON.parse(request.payload.state);
                    } catch (ex) {
                        throw Boom.badRequest('Could not parse provided state JSON');
                    }

                    if (state.token) {
                        user = await User.findOne({ where: { activate_token: state.token } });
                        if (!user) throw Boom.badRequest('Could not find provided token');
                    }

                    const client = await getOpenIdClient(state.team);
                    const nonce = request.state['sso-nonce'];

                    let res = null;

                    try {
                        res = await client.callback(
                            `${frontend.https ? 'https' : 'http'}://${frontend.domain}/signin/sso`,
                            request.payload,
                            { nonce, state: request.payload.state }
                        );
                    } catch (ex) {
                        server.logger.error('Unsuccessful OpenID callback');
                        server.logger.error(ex);
                        throw Boom.unauthorized();
                    }

                    const profile = res.claims();
                    const oAuthSignin = `sso::${state.team}/${profile.sub}`;

                    if (state.token) {
                        user.oauth_signin = oAuthSignin;
                        user.email = profile.email || '';
                        user.role = 'editor';
                        user.pwd = '';
                        await user.save();
                    } else {
                        // check if we already have this user id in our database
                        user = await User.findOne({ where: { oauth_signin: oAuthSignin } });

                        if (!user) {
                            // create new user

                            user = await User.create({
                                role: 'editor',
                                email: profile.email || '',
                                pwd: '',
                                oauth_signin: oAuthSignin
                            });
                        }
                    }

                    const userTeam = await UserTeam.findOne({
                        where: {
                            user_id: user.id,
                            organization_id: state.team
                        }
                    });

                    if (!userTeam) {
                        await UserTeam.create({
                            user_id: user.id,
                            organization_id: state.team,
                            team_role: 'member'
                        });
                    } else {
                        userTeam.invite_token = '';
                        await userTeam.save();
                    }

                    const session = await login(user.id, request.auth.credentials, true);
                    await request.server.methods.logAction(user.id, 'login/sso');

                    return h
                        .response({
                            [api.sessionID]: session.id
                        })
                        .state(api.sessionID, session.id, getStateOpts(request.server, 90))
                        .redirect('/');
                }
            }
        });
    }
};
