const { UserTeam, Team } = require('@datawrapper/orm/models');
const Joi = require('joi');
const { getUserLanguage } = require('../../../../../utils/index');
const Boom = require('@hapi/boom');
const got = require('got');

module.exports = {
    name: 'routes/team/reject',
    version: '1.0.0',
    async register(server) {
        server.route({
            method: 'GET',
            path: '/invite/{token}/reject',
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
                    const language = getUserLanguage(request.auth);
                    const __ = key => server.methods.translate(key, { scope: 'core', language });

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
                            method: 'DELETE',
                            headers
                        }
                    );

                    if (response.statusCode === 204) {
                        const userIsLoggedIn = request.auth.artifacts.role !== 'guest';
                        if (userIsLoggedIn) {
                            const teamInfo = await Team.findOne({
                                where: { id: teamId }
                            });
                            const invitedToTeamName = teamInfo.dataValues.name;
                            const url =
                                '/?t=s&m=' +
                                __('teams / reject-invitation / success').replace(
                                    '%s',
                                    invitedToTeamName
                                );
                            return h.redirect(url);
                        } else {
                            return h.redirect('https://www.datawrapper.de/?teamRejectSuccess');
                        }
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
