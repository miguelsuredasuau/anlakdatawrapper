const Boom = require('@hapi/boom');
const Joi = require('joi');
const { User, Team } = require('@datawrapper/orm/models');

module.exports = {
    name: 'datawrapper-invite',
    version: '1.0.0',
    async register(server) {
        server.route({
            method: 'GET',
            path: '/{token}',
            options: {
                auth: 'guest',
                validate: {
                    params: Joi.object({
                        token: Joi.string()
                            .alphanum()
                            .required()
                            .description('25 character long activation token.')
                    })
                },
                async handler(request, h) {
                    const __ = server.methods.getTranslate(request);

                    if (request.auth.artifacts.role !== 'guest') {
                        throw new Boom.conflict(__('settings / invite / logged-in / heading'), {
                            text: __('settings / invite / logged-in / message')
                        });
                    }

                    const inviteToken = request.params.token;
                    const invitee = await User.findOne({
                        where: { activate_token: inviteToken, deleted: false }
                    });

                    if (!invitee) {
                        throw new Boom.conflict(__('settings / invite / expired / heading'), {
                            text: __('settings / invite / expired / message')
                        });
                    }

                    const inviteTeam = await Team.findOne({
                        include: [
                            {
                                model: User,
                                where: { id: invitee.id },
                                through: {
                                    attributes: ['invite_token'],
                                    where: {
                                        invite_token: inviteToken
                                    }
                                }
                            }
                        ]
                    });

                    return h.view('account/DatawrapperInvite.svelte', {
                        props: {
                            token: inviteToken,
                            teamId: inviteTeam ? inviteTeam.id : false,
                            headlineText: inviteTeam
                                ? __('team / invite / headline', 'core', { s: inviteTeam.name })
                                : __('team / invite / headline-no-team'),
                            introText: __(`team / invite / intro${!inviteTeam ? '-no-team' : ''}`),
                            buttonText: __(
                                `team / invite / button${!inviteTeam ? '-no-team' : ''}`
                            ),
                            email: invitee.email
                        }
                    });
                }
            }
        });
    }
};
