const Boom = require('@hapi/boom');
const { User } = require('@datawrapper/orm/models');

User;
module.exports = {
    name: 'routes/account/reset-password',
    version: '1.0.0',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/{token}',
            options: {
                auth: 'session',
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
