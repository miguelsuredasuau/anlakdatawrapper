const Joi = require('joi');

module.exports = {
    name: 'routes/account/activate',
    version: '1.0.0',
    async register(server) {
        const User = server.methods.getModel('user');

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

                    const __ = server.methods.getTranslate(request);

                    let url = '';
                    if (user) {
                        user.role = 'editor';
                        user.activate_token = '';
                        const email = user.email;
                        const translationKey = `account / activate / success${
                            !email ? ' / no-email' : ''
                        }`;
                        const successText = email
                            ? __(translationKey, 'core', { s: email })
                            : __(translationKey);
                        await user.save();
                        url = `/?t=s&m=` + encodeURIComponent(successText);
                    } else {
                        url = `/?t=e&m=` + encodeURIComponent(__('account / activate / invalid'));
                    }
                    return h.redirect(url);
                }
            }
        });
    }
};
