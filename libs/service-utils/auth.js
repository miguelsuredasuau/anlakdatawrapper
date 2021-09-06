const Boom = require('@hapi/boom');
const { customAlphabet } = require('nanoid');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const get = require('lodash/get');

const DEFAULT_SALT = 'uRPAqgUJqNuBdW62bmq3CLszRFkvq4RW';

const generateToken = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    25
);

module.exports = function createAuth(
    { AccessToken, User, UserData, Session, Chart, Team },
    { includeTeams } = {}
) {
    function adminValidation({ artifacts } = {}) {
        if (artifacts.role !== 'admin') {
            throw Boom.unauthorized('ADMIN_ROLE_REQUIRED');
        }
    }

    function userValidation({ artifacts } = {}) {
        if (artifacts.role === 'guest') {
            throw Boom.unauthorized('USER_ROLE_REQUIRED');
        }
    }

    function cookieTTL(days) {
        return 1000 * 3600 * 24 * days; // 1000ms = 1s -> 3600s = 1h -> 24h = 1d
    }

    async function getUser(userId, { credentials, strategy, logger } = {}) {
        let user = await User.findByPk(userId, {
            attributes: [
                'id',
                'email',
                'role',
                'language',
                'activate_token',
                'reset_password_token',
                'deleted'
            ],
            ...(includeTeams
                ? {
                      include: [{ model: Team, attributes: ['id', 'name'] }]
                  }
                : {})
        });
        if (user && includeTeams) {
            const activeTeam = await user.getActiveTeam();
            if (activeTeam) user.teams.forEach(team => {
                if (activeTeam.id === team.id) {
                    team.active = true;
                    team.dataValues.active = true;
                }
            });
            user.activeTeam = activeTeam;
        }

        if (user && user.deleted) {
            return { isValid: false, message: Boom.unauthorized('User not found', strategy) };
        }

        if (!user && credentials.session) {
            const notSupported = name => {
                return () => {
                    logger && logger.warn(`user.${name} is not supported for guests`);
                    return false;
                };
            };
            // use non-persistant User model instance
            user = User.build({
                role: 'guest',
                id: undefined,
                language: get(credentials, 'data.data.dw-lang', 'en-US')
            });
            // make sure it never ends up in our DB
            user.save = notSupported('save');
            user.update = notSupported('update');
            user.destroy = notSupported('destroy');
            user.reload = notSupported('reload');
        }

        return { isValid: true, credentials, artifacts: user };
    }

    /**
     * Generate a sha256 hash from a string. This is used in the PHP API and is needed for backwards
     * compatibility.
     *
     * @param {string} pwhash - value to hash with sha256
     * @param {string} secret - salt to hash the value with
     * @returns {string}
     */
    function legacyHash(pwhash, secret = DEFAULT_SALT) {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(pwhash);
        return hmac.digest('hex');
    }

    /**
     * The old PHP API used sha256 to hash passwords with constant salts.
     * The Node.js API uses bcrypt which is more secure.
     * It is still important to support the old way for migration purposes since PHP and Node API
     * will live side by side for some time.
     * When the PHP Server gets turned off, we can hopefully delete this function.
     *
     * @deprecated
     * @param {string} password - Password string sent from the client (Can be client side hashed or not)
     * @param {string} passwordHash - Password hash to compare (from DB)
     * @param {string} authSalt - defined in config.js
     * @param {string} secretAuthSalt - defined in config.js
     * @returns {boolean}
     */
    function legacyLogin(password, passwordHash, authSalt, secretAuthSalt) {
        let serverHash = secretAuthSalt ? legacyHash(password, secretAuthSalt) : password;

        if (serverHash === passwordHash) return true;

        const clientHash = legacyHash(password, authSalt);
        serverHash = secretAuthSalt ? legacyHash(clientHash, secretAuthSalt) : clientHash;
        return serverHash === passwordHash;
    }

    /**
     * Migrate the old sha256 password hash to a more modern and secure bcrypt hash.
     *
     * @param {number} userId - ID of the user to migrate
     * @param {string} password - User password
     * @param {number} hashRounds - Iteration amout for bcrypt
     */
    async function migrateHashToBcrypt(userId, password, hashRounds) {
        const hash = await bcrypt.hash(password, hashRounds);

        await User.update(
            {
                pwd: hash
            },
            { where: { id: userId } }
        );
    }

    /**
     * Hash a password with bcrypt. This function doesn't need to be directly imported since it's
     * exposed on the Hapi server object as server method.
     *
     * @example
     * const hash = await server.methods.hashPassword('hunter2')
     *
     * @param {number} hashRounds - Number of rounds for the brypt algorithm
     */
    function createHashPassword(hashRounds) {
        return async function hashPassword(password) {
            return password === '' ? password : bcrypt.hash(password, hashRounds);
        };
    }

    function createComparePassword(server) {
        /**
         * Check validity of a password against the saved password hash
         *
         * @param {string} password - Plaintext password to check
         * @param {string} passwordHash - Password hash to compare (from DB)
         * @param {object} options
         * @param {number} options.userId - User ID for hash migration
         * @returns {Boolean}
         */
        return async function comparePassword(password, passwordHash, { userId }) {
            const { api } = server.methods.config();
            let isValid = false;
            /**
             * Bcrypt uses a prefix for versioning. That way a bcrypt hash can be identified with "$2".
             * https://en.wikipedia.org/wiki/Bcrypt#Description
             */
            if (passwordHash.startsWith('$2')) {
                isValid = await bcrypt.compare(password, passwordHash);
                /**
                 * Due to the migration from sha256 to bcrypt, the API must deal with sha256 passwords that
                 * got created by the PHP API and migrated from the `migrateHashToBcrypt` function.
                 * The node API get's passwords only in clear text and to compare those with a migrated
                 * password, it first has to generate the former client hashed password.
                 */
                if (!isValid) {
                    isValid = await bcrypt.compare(
                        legacyHash(password, api.authSalt),
                        passwordHash
                    );
                }
            } else {
                /**
                 * The user password hash was created by the PHP API and is not a bcrypt hash. That means
                 * the API needs to use the old comparison method with double sha256 hashes.
                 */
                isValid = legacyLogin(password, passwordHash, api.authSalt, api.secretAuthSalt);

                /**
                 * When the old method works, the API migrates the old hash to a bcrypt hash for more
                 * security. This ensures a seemless migration for users.
                 */
                if (isValid && userId && api.enableMigration) {
                    await migrateHashToBcrypt(userId, password, api.hashRounds);
                }
            }
            return isValid;
        };
    }

    function getStateOpts(
        server,
        ttl,
        sameSite = process.env.NODE_ENV === 'development' ? 'None' : 'Lax'
    ) {
        return {
            isSecure: server.methods.config('frontend').https,
            strictHeader: false,
            domain: `.${server.methods.config('api').domain}`,
            isSameSite: sameSite,
            path: '/',
            ttl: cookieTTL(ttl)
        };
    }

    async function associateChartsWithUser(sessionId, userId) {
        /* Sequelize returns [0] when no row was updated */
        if (!sessionId) return [0];

        return Chart.update(
            {
                author_id: userId,
                guest_session: null
            },
            {
                where: {
                    author_id: null,
                    guest_session: sessionId
                }
            }
        );
    }

    async function createSession(id, userId, keepSession = true, type = 'password') {
        return Session.create({
            id,
            user_id: userId,
            persistent: keepSession,
            data: {
                'dw-user-id': userId,
                persistent: keepSession,
                last_action_time: Math.floor(Date.now() / 1000),
                type
            }
        });
    }

    async function bearerValidation(request, token, h) {
        const row = await AccessToken.findOne({ where: { token, type: 'api-token' } });

        if (!row) {
            return { isValid: false, message: Boom.unauthorized('Token not found', 'Token') };
        }

        await row.update({ last_used_at: new Date() });

        const auth = await getUser(row.user_id, {
            credentials: { token },
            strategy: 'Token'
        });
        if (!auth.artifacts.isActivated()) {
            // only activated users may authenticate through bearer tokens
            return { isValid: false, message: Boom.unauthorized('User not activated', 'Token') };
        }
        if (auth.isValid) {
            auth.credentials.scope =
                !row.data.scopes || row.data.scopes.includes('all')
                    ? request.server.methods.getScopes(auth.artifacts.isAdmin())
                    : row.data.scopes;
        }
        return auth;
    }

    async function cookieValidation(request, session, h) {
        let row = await Session.findByPk(session);

        if (!row) {
            return { isValid: false, message: Boom.unauthorized('Session not found', 'Session') };
        }

        row = await row.update({
            data: {
                ...row.data,
                last_action_time: Math.floor(Date.now() / 1000)
            }
        });

        const auth = await getUser(row.data['dw-user-id'], {
            credentials: { session, data: row },
            strategy: 'Session',
            logger: typeof request.server.logger === 'object' ? request.server.logger : undefined
        });

        if (auth.isValid) {
            if (typeof request.server.methods.getScopes === 'function') {
                // add all scopes to cookie session
                auth.credentials.scope = request.server.methods.getScopes(auth.artifacts.isAdmin());
            }

            auth.sessionType = row.data.type;
        }
        return auth;
    }

    function createCookieAuthScheme(createGuestSessions) {
        return function cookieAuth(server, options) {
            const api = server.methods.config('api');
            const opts = { cookie: api.sessionID, ...options };

            server.state(opts.cookie, getStateOpts(server, 90));

            const scheme = {
                authenticate: async (request, h) => {
                    let session = request.state[opts.cookie];

                    /**
                     * Sometimes there are 2 session cookies, in the staging environment, with name
                     * DW-SESSION. The reason is that the same name is used on live (.datawrapper.de) and
                     * staging (.staging.datawrapper.de). The cookie parser therefore returns an array with
                     * both cookies and since the server doesn't send any information which cookie belongs
                     * to which domain, the code relies on the server sending the more specific cookie
                     * first. This is fine since it only happens on staging and the quick fix is to delete
                     * the wrong cookie in dev tools.
                     *
                     * More information and a similar issue can be found on Github:
                     * https://github.com/jshttp/cookie/issues/18#issuecomment-30344206
                     */
                    if (Array.isArray(session)) {
                        session = session[0];
                    }

                    const {
                        isValid,
                        credentials,
                        artifacts,
                        sessionType,
                        message = Boom.unauthorized(null, 'Session')
                    } = await cookieValidation(request, session, h);

                    const sameSite = process.env.NODE_ENV === 'development' ? 'None' : 'Lax';

                    if (isValid) {
                        const cookieOpts = getStateOpts(
                            server,
                            90,
                            sessionType === 'token' ? 'None' : sameSite
                        );
                        h.state(opts.cookie, session, cookieOpts);
                        return h.authenticated({ credentials, artifacts });
                    } else if (createGuestSessions) {
                        // no cookie or session expired, let's create a new session
                        const sessionId = generateToken();

                        const session = await Session.create({
                            id: sessionId,
                            user_id: null,
                            persistent: false,
                            data: {
                                'dw-user-id': null,
                                persistent: false,
                                last_action_time: Math.floor(Date.now() / 1000)
                            }
                        });

                        const cookieOpts = getStateOpts(
                            server,
                            90,
                            sessionType === 'token' ? 'None' : sameSite
                        );
                        h.state(opts.cookie, sessionId, cookieOpts);

                        const auth = await getUser('guest', {
                            credentials: { session: session.id, data: session },
                            strategy: 'Session'
                        });

                        return h.authenticated(auth);
                    }

                    return message;
                }
            };

            return scheme;
        };
    }

    async function login(userId, session, keepSession = false) {
        if (session && session.data) {
            session = session.data;
            /* associate guest session with newly created user */
            await Promise.all([
                session.update({
                    data: {
                        ...session.data,
                        'dw-user-id': userId,
                        last_action_time: Math.floor(Date.now() / 1000)
                    },
                    user_id: userId,
                    persistent: keepSession
                }),
                associateChartsWithUser(session.id, userId)
            ]);
        } else {
            session = await createSession(generateToken(), userId, keepSession);
        }

        return session;
    }

    return {
        getUser,
        adminValidation,
        userValidation,
        cookieTTL,

        cookieValidation,
        createCookieAuthScheme,
        bearerValidation,

        legacyHash,
        createHashPassword,
        createComparePassword,
        getStateOpts,
        associateChartsWithUser,
        createSession,
        generateToken,
        login
    };
};
