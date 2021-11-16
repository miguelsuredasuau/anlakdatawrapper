const { User } = require('@datawrapper/orm/models');
const Joi = require('joi');
const { getUserLanguage } = require('../../utils/index');
const Boom = require('@hapi/boom');

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
                    const language = getUserLanguage(request.auth);
                    const __ = key => server.methods.translate(key, { scope: 'core', language });

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

                    const activeTeam = await invitee.getActiveTeam();
                    const invitedToTeam = activeTeam.dataValues.id;
                    const invitedToTeamName = activeTeam.dataValues.name;

                    return h.view('account/DatawrapperInvite.svelte', {
                        props: {
                            token: inviteToken,
                            team: invitedToTeam,
                            headlineText: __('team / invite / headline').replace(
                                '%s',
                                invitedToTeamName
                            ),
                            introText: __('team / invite / intro'),
                            buttonText: __('team / invite / button'),
                            email: invitee.dataValues.email
                        }
                    });
                }
            }
        });
    }
};
