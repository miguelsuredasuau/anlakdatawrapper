const { UserTeam, User } = require('@datawrapper/orm/models');
const Joi = require('joi');
const Boom = require('@hapi/boom');
const got = require('got');

module.exports = {
    name: 'routes/team/accept',
    version: '1.0.0',
    async register(server) {
        server.route({
            method: 'GET',
            path: '/invite/{token}/accept',
            options: {
                auth: 'guest',
                validate: {
                    params: Joi.object({
                        teamId: Joi.string()
                            .required()
                            .description('Team ID (eg. guardians-of-the-galaxy)'),
                        token: Joi.string().required().description('A valid team invitation token')
                    })
                },
                async handler(request, h) {
                    const __ = server.methods.getTranslate(request);

                    const teamId = request.params.teamId;
                    const inviteToken = request.params.token;

                    const userTeam = await UserTeam.findOne({
                        where: { invite_token: inviteToken }
                    });

                    if (!userTeam) {
                        throw new Boom.conflict(__('settings / invite / expired / heading'), {
                            text: __('settings / invite / expired / message')
                        });
                    }

                    const inviteeId = userTeam.dataValues.user_id;
                    const invitee = await User.findOne({
                        where: { id: inviteeId }
                    });

                    const email = invitee.email;
                    const loggedInUser = request.auth.artifacts;

                    if (inviteeId !== loggedInUser.dataValues.id) {
                        const userIsLoggedIn = request.auth.artifacts.role !== 'guest';

                        if (userIsLoggedIn) {
                            throw new Boom.conflict(
                                __('settings / invite / wrong-user / heading'),
                                {
                                    text: __('settings / invite / wrong-user / message').replace(
                                        '%email%',
                                        email
                                    )
                                }
                            );
                        } else {
                            throw new Boom.conflict(
                                __('settings / invite / not-logged-in / heading'),
                                {
                                    text: __('settings / invite / not-logged-in / message').replace(
                                        '%email%',
                                        email
                                    )
                                }
                            );
                        }
                    }

                    // API request
                    const config = server.methods.config();
                    const apiBase = `${config.api.https ? 'https' : 'http'}://${
                        config.api.subdomain
                    }.${config.api.domain}/v3`;
                    const { auth } = request;
                    const headers = {
                        Cookie: `${config.api.sessionID}=${
                            auth.credentials && auth.credentials.data
                                ? auth.credentials.data.id
                                : ''
                        };crumb=spam`,
                        'X-CSRF-Token': 'spam'
                    };
                    const response = await got(
                        `${apiBase}/teams/${teamId}/invites/${inviteToken}`,
                        {
                            method: 'POST',
                            headers
                        }
                    );

                    if (response.statusCode === 201) {
                        return h.redirect(`/team/${teamId}`);
                    } else {
                        throw new Boom.conflict(__('settings / invite / expired / heading'), {
                            text: __('settings / invite / expired / message')
                        });
                    }
                }
            }
        });
    }
};
