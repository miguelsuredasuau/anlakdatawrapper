const Boom = require('@hapi/boom');
const Bell = require('@hapi/bell');
const { User } = require('@datawrapper/orm/models');

const { login, getStateOpts } = require('@datawrapper/service-utils/auth')(
    require('@datawrapper/orm/models')
);

module.exports = {
    name: 'routes/signin/oauth',
    version: '1.0.0',
    register: async server => {
        const oauth = server.methods.config('general').oauth;
        const frontend = server.methods.config('frontend');
        const api = server.methods.config('api');
        const { preventGuestAccess } = frontend;

        Object.keys(oauth?.providers || {}).forEach(provider => {
            if (!Object.keys(Bell.providers).includes(provider)) return;
            server.route({
                method: ['GET', 'POST'],
                path: `/${provider}`,
                options: {
                    auth: {
                        mode: 'try',
                        strategy: provider
                    },
                    handler: async function (request, h) {
                        if (!request.auth.isAuthenticated) {
                            throw Boom.unauthorized();
                        }

                        const { profile } = request.auth.credentials;

                        const oAuthSignin = `${provider}::${profile.id}`;

                        // replace unsafe characters in user names to prevent XSS or
                        // misleading user names (e.g. those that look like email addresses)
                        const matchUnsafeChars = new RegExp(
                            '[^\\p{Alpha}\\p{N}\\p{Emoji}\\p{Pd}\\s.]+',
                            'gu'
                        );
                        const name = (profile.displayName || profile.username || '').replace(
                            matchUnsafeChars,
                            ' '
                        );
                        const email = profile.email;

                        // check if we already have this user id in our database
                        let user = await User.findOne({
                            where: { deleted: false, oauth_signin: oAuthSignin }
                        });

                        if (!user && email) {
                            // if not, check if that email is already registered
                            user = await User.findOne({ where: { deleted: false, email } });

                            if (user) {
                                // that email already exists, but it is activated?
                                if (user.role !== 'pending') {
                                    // yes, user exists and was activated
                                    user.name = name;
                                    user.oauth_signin = oAuthSignin;
                                    user.sm_profile = getSocialMediaProfileUrl(provider, profile);
                                } else {
                                    // this was never activated, so ANYONE could have created
                                    // the account. since we now know the real owner, let's
                                    // reset the password to be save that whoever created
                                    // the account in the first place, but didn't activate the
                                    // email, no longer has access!
                                    user.pwd = '';
                                }
                            }
                        } else if (!user) {
                            // try to find user by the "alternative" signin id
                            // starting with password:: instead of the provider name
                            const altOAuthSignin = `password::${profile.id}`;
                            user = await User.findOne({
                                deleted: false,
                                where: { deleted: false, oauth_signin: altOAuthSignin }
                            });
                            if (user) {
                                // we need to repair the oauth_signin to no longer
                                // use the password:: prefix
                                user.oauth_signin = oAuthSignin;
                                user.sm_profile = getSocialMediaProfileUrl(provider, profile);
                            }
                        }

                        if (user) {
                            await user.save();
                        } else {
                            if (preventGuestAccess) {
                                throw Boom.unauthorized();
                            }
                            // create new user
                            user = await User.create({
                                role: 'editor',
                                name,
                                email: email || '',
                                pwd: '',
                                oauth_signin: oAuthSignin,
                                sm_profile: getSocialMediaProfileUrl(provider, profile)
                            });
                        }

                        const session = await login(user.id, request.auth.credentials, true);
                        await request.server.methods.logAction(user.id, `login/${provider}`);

                        const { ref } = request.query;

                        return h
                            .response({
                                [api.sessionID]: session.id
                            })
                            .state(api.sessionID, session.id, getStateOpts(request.server, 90))
                            .redirect(ref || '/');
                    }
                }
            });
        });

        function getSocialMediaProfileUrl(provider, profile) {
            switch (provider) {
                case 'twitter':
                    return `https://twitter.com/${profile.username}`;
                case 'github':
                    return `https://github.com/${profile.username}`;
                default:
                    return null;
            }
        }
    }
};
