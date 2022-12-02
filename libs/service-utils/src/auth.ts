import type { SessionModel, TeamModel, UserModel } from '@datawrapper/orm';
import { AccessToken, Chart, Session, Team, User } from '@datawrapper/orm/db';
import Boom from '@hapi/boom';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { ResponseToolkit } from 'hapi';
import get from 'lodash/get';
// TODO: submit bug report to TS about import from nanoid incorrectly causing TS errors when moduleResolution set to "node16"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { customAlphabet } from 'nanoid';
import type { Request, Server } from './serverTypes';

const DEFAULT_SALT = 'uRPAqgUJqNuBdW62bmq3CLszRFkvq4RW';
const MAX_SESSION_COOKIES_IN_REQ = 2;

const generateToken = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    25
);

type GetUserParams = {
    credentials: {
        data?: {
            data?: Record<string, unknown>;
        };
        scope?: string[];
        session?: string;
        token?: string;
    };
    logger?:
        | {
              warn(message: string): void;
          }
        | undefined;
    strategy?: string;
};

type Artifacts = {
    role: string;
};

type ExtendedTeamModel = TeamModel & {
    active?: boolean;
    dataValues: TeamModel['dataValues'] & {
        active?: boolean;
    };
};

type ExtendedUserModel = Omit<UserModel, 'getActiveTeam' | 'teams'> & {
    activeTeam?: ExtendedTeamModel | null | undefined;
    getActiveTeam(): Promise<ExtendedTeamModel | null | undefined>;
    teams?: ExtendedTeamModel[];
};

export function createAuth({ includeTeams = false } = {}) {
    function adminValidation({ artifacts }: { artifacts: Artifacts }) {
        if (artifacts.role !== 'admin') {
            throw Boom.unauthorized('ADMIN_ROLE_REQUIRED');
        }
    }

    function userValidation({ artifacts }: { artifacts: Artifacts }) {
        if (artifacts.role === 'guest') {
            throw Boom.unauthorized('USER_ROLE_REQUIRED');
        }
    }

    function cookieTTL(days: number) {
        return 1000 * 3600 * 24 * days; // 1000ms = 1s -> 3600s = 1h -> 24h = 1d
    }

    async function getUser(
        userId: number | 'guest',
        { credentials, strategy, logger }: GetUserParams
    ) {
        let user: ExtendedUserModel | null = await User.findByPk(userId, {
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
            const activeTeam: ExtendedTeamModel | undefined | null = await user.getActiveTeam();
            if (activeTeam)
                user.teams?.forEach(team => {
                    if (activeTeam.id === team.id) {
                        team.active = true;
                        team.dataValues.active = true;
                    }
                });
            user.activeTeam = activeTeam;
        }

        if (user && user.deleted) {
            return {
                isValid: false as const,
                message: Boom.unauthorized('User not found', strategy as string)
            };
        }

        if (!user && credentials?.session) {
            const notSupported = (name: string) => {
                return (): never => {
                    logger && logger.warn(`user.${name} is not supported for guests`);
                    return false as never;
                };
            };
            // use non-persistant User model instance
            const newUser = User.build({
                role: 'guest',
                id: undefined,
                language: get(credentials, 'data.data.dw-lang', 'en-US') as string
            });
            // make sure it never ends up in our DB
            newUser.save = notSupported('save');
            newUser.update = notSupported('update');
            newUser.destroy = notSupported('destroy');
            newUser.reload = notSupported('reload');
            user = newUser;
        }

        return { isValid: true as const, credentials, artifacts: user };
    }

    /**
     * Generate a sha256 hash from a string. This is used in the PHP API and is needed for backwards
     * compatibility.
     *
     * @param {string} pwhash - value to hash with sha256
     * @param {string} secret - salt to hash the value with
     * @returns {string}
     */
    function legacyHash(pwhash: string, secret = DEFAULT_SALT) {
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
    function legacyLogin(
        password: string,
        passwordHash: string,
        authSalt?: string,
        secretAuthSalt?: string
    ) {
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
    async function migrateHashToBcrypt(userId: number, password: string, hashRounds: number) {
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
    function createHashPassword(hashRounds: number) {
        return async function hashPassword(password: string) {
            return password === '' ? password : bcrypt.hash(password, hashRounds);
        };
    }

    function createComparePassword(server: Server) {
        /**
         * Check validity of a password against the saved password hash
         *
         * @param {string} password - Plaintext password to check
         * @param {string} passwordHash - Password hash to compare (from DB)
         * @param {object} options
         * @param {number} options.userId - User ID for hash migration
         * @returns {Boolean}
         */
        return async function comparePassword(
            password: string,
            passwordHash: string,
            { userId }: { userId: number }
        ) {
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
                        legacyHash(password, api?.authSalt),
                        passwordHash
                    );
                }
            } else {
                /**
                 * The user password hash was created by the PHP API and is not a bcrypt hash. That means
                 * the API needs to use the old comparison method with double sha256 hashes.
                 */
                isValid = legacyLogin(password, passwordHash, api?.authSalt, api?.secretAuthSalt);

                /**
                 * When the old method works, the API migrates the old hash to a bcrypt hash for more
                 * security. This ensures a seemless migration for users.
                 */
                if (isValid && userId && api?.enableMigration) {
                    // TODO: what if hashRounds is not defined?
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    await migrateHashToBcrypt(userId, password, api.hashRounds!);
                }
            }
            return isValid;
        };
    }

    function getStateOpts(
        server: Server,
        ttl: number,
        sameSite: 'Lax' | 'Strict' | false | undefined = 'Lax'
    ) {
        return {
            isSecure: server.methods.config('frontend')?.https,
            strictHeader: false,
            domain: `.${server.methods.config('api')?.domain}`,
            isSameSite: sameSite,
            path: '/',
            ttl: cookieTTL(ttl)
        };
    }

    async function associateChartsWithUser(sessionId: string, userId: number) {
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

    // Cannot refer to SessionModel here because of TS + Sequelize + monorepo issue:
    // https://github.com/microsoft/TypeScript/issues/48212
    // https://github.com/microsoft/TypeScript/issues/47663
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function createSession(
        id: string,
        userId: number,
        keepSession = true,
        type = 'password'
    ): Promise<any> {
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

    async function bearerValidation(request: Request, token: string) {
        const row = await AccessToken.findOne({ where: { token, type: 'api-token' } });

        if (!row) {
            return { isValid: false, message: Boom.unauthorized('Token not found', 'Token') };
        }

        await row.update({ last_used_at: new Date() });

        const auth = await getUser(row.user_id, {
            credentials: { token },
            strategy: 'Token'
        });
        if (!auth.artifacts?.isActivated()) {
            // only activated users may authenticate through bearer tokens
            return { isValid: false, message: Boom.unauthorized('User not activated', 'Token') };
        }
        if (auth.isValid) {
            auth.credentials.scope =
                !row.data.scopes || (row.data.scopes as string[]).includes('all')
                    ? request.server.methods.getScopes(auth.artifacts.isAdmin())
                    : (row.data.scopes as string[]);
        }
        return auth;
    }

    async function cookieValidation(request: Request, sessionIds: string[]) {
        const sessions = await Session.findAll({ where: { id: sessionIds } });

        if (!sessions.length) {
            return { error: Boom.unauthorized('Session not found', 'Session') };
        }

        for (let session of sessions) {
            session = await session.update({
                data: {
                    ...session.data,
                    last_action_time: Math.floor(Date.now() / 1000)
                }
            });

            const auth = await getUser(session.data['dw-user-id'] as number, {
                credentials: { session: session.id, data: session },
                strategy: 'Session',
                logger:
                    typeof request.server.logger === 'object' ? request.server.logger : undefined
            });

            if (auth.isValid) {
                if (typeof request.server.methods.getScopes === 'function') {
                    // add all scopes to cookie session
                    // TODO: figure out why TS does not narrow down the type knowing that auth is valid
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    auth.credentials!.scope = request.server.methods.getScopes(
                        auth.artifacts?.isAdmin()
                    );
                }

                return {
                    ...auth,
                    sessionType: session.data.type
                };
            }
        }

        return { error: Boom.unauthorized(null, 'Session') };
    }

    function createCookieAuthScheme(createGuestSessions: boolean) {
        return function cookieAuth(server: Server, options: Record<string, unknown>) {
            const api = server.methods.config('api');
            // TODO: what if sessionID is not defined?
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const opts = { cookie: api!.sessionID!, ...options };

            server.state(opts.cookie, getStateOpts(server, 90));

            const scheme = {
                authenticate: async (request: Request, h: ResponseToolkit) => {
                    const cookieValueOrArray = request.state[opts.cookie];
                    const sessionIds = [];
                    if (Array.isArray(cookieValueOrArray)) {
                        // There are multiple session cookies in the request.
                        sessionIds.push(...cookieValueOrArray.slice(0, MAX_SESSION_COOKIES_IN_REQ));
                    } else if (cookieValueOrArray) {
                        // There is one session cookie in the request.
                        sessionIds.push(cookieValueOrArray);
                    }

                    const cookieValidationResult = await cookieValidation(request, sessionIds);

                    if (!cookieValidationResult.error) {
                        const { credentials, artifacts, sessionType } = cookieValidationResult;
                        const cookieOpts = getStateOpts(
                            server,
                            90,
                            // TODO: fix the type mismatch
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            sessionType === 'token' ? ('None' as any) : undefined
                        );
                        // TODO: figure out explicit types
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        h.state(opts.cookie, credentials!.session!, cookieOpts);
                        return h.authenticated({
                            credentials,
                            artifacts: artifacts as NonNullable<typeof artifacts> | undefined
                        });
                    }

                    if (createGuestSessions) {
                        // TODO: figure out the types; sessionType is going to always be empty here?
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const { sessionType } = cookieValidationResult as any;
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
                            // TODO: fix the type mismatch
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            sessionType === 'token' ? ('None' as any) : undefined
                        );
                        h.state(opts.cookie, sessionId, cookieOpts);

                        const auth = await getUser('guest', {
                            credentials: { session: session.id, data: session },
                            strategy: 'Session'
                        });

                        // TODO: fix the type mismatch
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return h.authenticated(auth as any);
                    }

                    return cookieValidationResult.error;
                }
            };

            return scheme;
        };
    }

    async function login(
        userId: number,
        inputSession: { data?: SessionModel },
        keepSession = false
    ) {
        if (inputSession && inputSession.data) {
            const session = inputSession.data;
            /* associate guest session with newly created user */
            await Promise.all([
                session.update({
                    data: {
                        ...session.data,
                        'dw-user-id': userId,
                        last_action_time: Math.floor(Date.now() / 1000),
                        persistent: keepSession
                    },
                    user_id: userId,
                    persistent: keepSession
                }),
                associateChartsWithUser(session.id, userId)
            ]);
            return session;
        } else {
            return await createSession(generateToken(), userId, keepSession);
        }
    }

    return {
        adminValidation,
        userValidation,

        cookieValidation,
        createCookieAuthScheme,
        bearerValidation,

        legacyHash,
        createHashPassword,
        createComparePassword,
        getStateOpts,
        associateChartsWithUser,
        createSession,
        login
    };
}
