const Boom = require('@hapi/boom');
const { User, Team, UserTeam } = require('@datawrapper/orm/models');
const get = require('lodash/get');
const Joi = require('joi');
const { db } = require('@datawrapper/orm');
const { Op } = db;
const SSOProviders = {
    openId: require('./sso/OIDCProvider'),
    saml: require('./sso/SAMLProvider')
};

const { login, getStateOpts } = require('@datawrapper/service-utils/auth')(
    require('@datawrapper/orm/models')
);

module.exports = {
    name: 'routes/signin/sso',
    version: '1.0.0',
    register: async server => {
        const api = server.methods.config('api');

        async function getTeamSSOSettings(teamId) {
            const team = await Team.findByPk(teamId);

            if (!team) {
                throw new Boom.unauthorized();
            }

            const sso = get(team.settings, 'sso', {});

            if (!sso.enabled) {
                throw new Boom.badRequest('SSO is not configured for this team.');
            }

            return sso;
        }

        server.route({
            method: ['GET'],
            path: `/sso/{teamId}`,
            options: {
                auth: {
                    mode: 'try'
                },
                validate: {
                    params: Joi.object({
                        teamId: Joi.string().required()
                    })
                },
                handler: async function (request, h) {
                    const { teamId } = request.params;
                    const ssoSettings = await getTeamSSOSettings(teamId);

                    const provider = await SSOProviders[ssoSettings.protocol].create(
                        server,
                        ssoSettings,
                        teamId
                    );
                    const { redirectUrl, nonce } = await provider.generateLoginUrl();

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
                validate: {
                    params: Joi.object({
                        teamId: Joi.string().required(),
                        token: Joi.string().alphanum().required()
                    })
                },
                handler: async function (request, h) {
                    const { teamId, token } = request.params;
                    const ssoSettings = await getTeamSSOSettings(teamId);

                    const provider = await SSOProviders[ssoSettings.protocol].create(
                        server,
                        ssoSettings,
                        teamId
                    );
                    const { redirectUrl, nonce } = await provider.generateLoginUrl(token);

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
                validate: {
                    payload: Joi.alternatives().try(
                        Joi.object({
                            SAMLResponse: Joi.string().required(),
                            RelayState: Joi.string().required()
                        }),
                        Joi.object({
                            state: Joi.string().required(),
                            code: Joi.string().required()
                        })
                    )
                },
                handler: async function (request, h) {
                    function parseState(payload) {
                        let state = null;

                        const payloadSchema = Joi.object({
                            team: Joi.string().required(),
                            token: Joi.string().optional()
                        }).unknown(true);

                        try {
                            state = JSON.parse(payload);
                        } catch (ex) {
                            throw Boom.badRequest('Could not parse provided state JSON');
                        }

                        if (payloadSchema.validate(state).error) {
                            throw Boom.badRequest(
                                'Invalid state object provided from identity provider'
                            );
                        }

                        return state;
                    }

                    let state = null;

                    if (request.payload.SAMLResponse) {
                        const { RelayState } = request.payload;
                        state = parseState(RelayState);
                    } else if (request.payload.state) {
                        state = parseState(request.payload.state);
                    }

                    const ssoSettings = await getTeamSSOSettings(state.team);
                    const provider = await SSOProviders[ssoSettings.protocol].create(
                        server,
                        ssoSettings,
                        state.team
                    );
                    const { oAuthSignin, email } = await provider.validateCallback(request);

                    let user = null;

                    if (email) {
                        if (Joi.string().email().validate(email).error) {
                            throw Boom.badRequest('Invalid email provided by identity provider.');
                        }
                    }

                    if (state.token) {
                        user = await User.findOne({ where: { activate_token: state.token } });
                        if (!user) throw Boom.badRequest('Could not find provided token');

                        if (email) {
                            const existingUser = await User.findOne({
                                where: {
                                    activate_token: {
                                        [Op.ne]: state.token
                                    },
                                    email: email
                                }
                            });

                            if (existingUser) {
                                throw Boom.badRequest(
                                    'A user with the email address provided by the identity provider already exists.'
                                );
                            }
                        }

                        user.oauth_signin = oAuthSignin;
                        user.email = email || '';
                        user.role = 'editor';
                        user.pwd = '';
                        await user.save();
                    } else {
                        // check if we already have this user id in our database
                        user = await User.findOne({ where: { oauth_signin: oAuthSignin } });

                        if (!user && email) {
                            // check if we already have a user in this team with the same email
                            const emailUser = await User.findOne({ where: { email: email } });

                            if (emailUser && (await emailUser.hasActivatedTeam(state.team))) {
                                // in that case, make this user use SSO instead
                                user = emailUser;
                                user.oauth_signin = oAuthSignin;
                                user.role = 'editor';
                                user.pwd = '';
                                await user.save();
                            }
                        }

                        if (!user) {
                            // else, create new user
                            user = await User.create({
                                role: 'editor',
                                email: email || '',
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
