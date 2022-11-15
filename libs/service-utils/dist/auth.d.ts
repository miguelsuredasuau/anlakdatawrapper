export function createAuth({ AccessToken, User, Session, Chart, Team }: {
    AccessToken: any;
    User: any;
    Session: any;
    Chart: any;
    Team: any;
}, { includeTeams }?: {
    includeTeams: any;
}): {
    getUser: (userId: any, { credentials, strategy, logger }?: {
        credentials: any;
        strategy: any;
        logger: any;
    }) => Promise<{
        isValid: boolean;
        message: Boom.Boom<any>;
        credentials?: never;
        artifacts?: never;
    } | {
        isValid: boolean;
        credentials: any;
        artifacts: any;
        message?: never;
    }>;
    adminValidation: ({ artifacts }?: {
        artifacts: any;
    }) => void;
    userValidation: ({ artifacts }?: {
        artifacts: any;
    }) => void;
    cookieTTL: (days: any) => number;
    cookieValidation: (request: any, sessionIds: any) => Promise<{
        isValid: boolean;
        message: Boom.Boom<any>;
        credentials?: never;
        artifacts?: never;
    } | {
        isValid: boolean;
        credentials: any;
        artifacts: any;
        message?: never;
    } | {
        error: Boom.Boom<any>;
    }>;
    createCookieAuthScheme: (createGuestSessions: any) => (server: any, options: any) => {
        authenticate: (request: any, h: any) => Promise<any>;
    };
    bearerValidation: (request: any, token: any) => Promise<{
        isValid: boolean;
        message: Boom.Boom<any>;
        credentials?: never;
        artifacts?: never;
    } | {
        isValid: boolean;
        credentials: any;
        artifacts: any;
        message?: never;
    }>;
    legacyHash: (pwhash: string, secret?: string) => string;
    createHashPassword: (hashRounds: number) => (password: any) => Promise<any>;
    createComparePassword: (server: any) => (password: string, passwordHash: string, { userId }: {
        userId: number;
    }) => boolean;
    getStateOpts: (server: any, ttl: any, sameSite?: string) => {
        isSecure: any;
        strictHeader: boolean;
        domain: string;
        isSameSite: string;
        path: string;
        ttl: number;
    };
    associateChartsWithUser: (sessionId: any, userId: any) => Promise<any>;
    createSession: (id: any, userId: any, keepSession?: boolean, type?: string) => Promise<any>;
    generateToken: () => string;
    login: (userId: any, session: any, keepSession?: boolean) => Promise<any>;
};
import Boom = require("@hapi/boom");
