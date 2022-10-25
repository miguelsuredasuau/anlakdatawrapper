const Boom = require('@hapi/boom');
const Joi = require('joi');

module.exports = {
    name: 'routes/account/reset-password',
    version: '1.0.0',
    register: async server => {
        const User = server.methods.getModel('user');

        server.route({
            method: 'GET',
            path: '/{token}',
            options: {
                auth: 'session',
                validate: {
                    params: Joi.object({
                        token: Joi.string()
                            .alphanum()
                            .length(25)
                            .required()
                            .description('25 character long password reset token.')
                    })
                },
                async handler({ params }, h) {
                    const userCount = await User.count({
                        where: {
                            reset_password_token: params.token,
                            deleted: false
                        }
                    });

                    if (userCount !== 1) {
                        return Boom.badRequest('The password reset link you entered is invalid.');
                    }

                    return h.view('account/ResetPassword.svelte', {
                        props: { token: params.token }
                    });
                }
            }
        });
    }
};
