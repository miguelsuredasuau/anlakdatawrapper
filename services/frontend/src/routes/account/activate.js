const { User } = require('@datawrapper/orm/models');
const Joi = require('joi');
const { getUserLanguage } = require('../../utils/index');

module.exports = {
    name: 'routes/account/activate',
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
                    })
                },
                async handler(request, h) {
                    const activationToken = request.params.token;
                    const user = await User.findOne({
                        where: { activate_token: activationToken, deleted: false }
                    });

                    const language = getUserLanguage(request.auth);
                    const __ = key => server.methods.translate(key, { scope: 'core', language });

                    let url = '';
                    if (user) {
                        user.role = 'editor';
                        user.activate_token = '';
                        await user.save();
                        url =
                            `/?t=s&m=` +
                            encodeURIComponent(
                                __('account / activate / success').replace(
                                    '%s',
                                    request.params.email
                                )
                            );
                    } else {
                        url = `/?t=e&m=` + encodeURIComponent(__('account / activate / invalid'));
                    }
                    return h.redirect(url);
                }
            }
        });
    }
};
