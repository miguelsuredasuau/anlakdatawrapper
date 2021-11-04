const { User } = require('@datawrapper/orm/models');
const Joi = require('joi');
const { getUserLanguage } = require('../../utils/index');

module.exports = {
    name: 'routes/account/invite',
    version: '1.0.0',
    async register(server) {
        server.route({
            method: 'GET',
            path: '/{token}',
            options: {
                validate: {
                    params: Joi.object({
                        token: Joi.string()
                            .alphanum()
                            .length(25)
                            .required()
                            .description('25 character long activation token.')
                    }),
                    query: Joi.object({
                        chart: Joi.string()
                            .alphanum()
                            .length(5)
                            .description('5 character long chart id.')
                    })
                },
                async handler(request, h) {
                    const activationToken = request.params.token;
                    const user = await User.findOne({
                        where: { activate_token: activationToken, deleted: false }
                    });
                    const language = getUserLanguage(request.auth);
                    const __ = key => server.methods.translate(key, { scope: 'core', language });

                    if (user) {
                        return h.view('account/SetPassword.svelte', {
                            props: {
                                token: activationToken,
                                email: user.dataValues.email,
                                chart: request.query.chart
                            }
                        });
                    } else {
                        const url =
                            `/?t=e&m=` +
                            encodeURIComponent(
                                __(
                                    'This activation token is invalid. Your email address is probably already activated.'
                                )
                            );
                        return h.redirect(url);
                    }
                }
            }
        });
    }
};