import type { SessionModel, TeamModel, UserModel } from '@datawrapper/orm';
import Boom from '@hapi/boom';
import type { ResponseToolkit } from 'hapi';
import type { Request, Server } from './serverTypes';
declare type Artifacts = {
    role: string;
};
declare type ExtendedTeamModel = TeamModel & {
    active?: boolean;
    dataValues: TeamModel['dataValues'] & {
        active?: boolean;
    };
};
declare type ExtendedUserModel = Omit<UserModel, 'getActiveTeam' | 'teams'> & {
    activeTeam?: ExtendedTeamModel | null | undefined;
    getActiveTeam(): Promise<ExtendedTeamModel | null | undefined>;
    teams?: ExtendedTeamModel[];
};
export declare function createAuth({ includeTeams }?: {
    includeTeams?: boolean | undefined;
}): {
    adminValidation: ({ artifacts }: {
        artifacts: Artifacts;
    }) => void;
    userValidation: ({ artifacts }: {
        artifacts: Artifacts;
    }) => void;
    cookieValidation: (request: Request, sessionIds: string[]) => Promise<{
        error: Boom.Boom<unknown>;
    } | {
        sessionType: unknown;
        isValid: true;
        credentials: {
            data?: {
                data?: Record<string, unknown>;
            };
            scope?: string[];
            session?: string;
            token?: string;
        };
        artifacts: ExtendedUserModel | null;
        message?: never;
        error?: never;
    }>;
    createCookieAuthScheme: (createGuestSessions: boolean) => (server: Server, options: Record<string, unknown>) => {
        authenticate: (request: Request, h: ResponseToolkit) => Promise<Boom.Boom<unknown> | import("hapi").Auth>;
    };
    bearerValidation: (request: Request, token: string) => Promise<{
        isValid: true;
        credentials: {
            data?: {
                data?: Record<string, unknown>;
            };
            scope?: string[];
            session?: string;
            token?: string;
        };
        artifacts: ExtendedUserModel | null;
        message?: never;
    } | {
        isValid: boolean;
        message: Boom.Boom<unknown>;
    }>;
    legacyHash: (pwhash: string, secret?: string) => string;
    createHashPassword: (hashRounds: number) => (password: string) => Promise<string>;
    createComparePassword: (server: Server) => (password: string, passwordHash: string, { userId }: {
        userId: number;
    }) => Promise<boolean>;
    getStateOpts: (server: Server, ttl: number, sameSite?: 'Lax' | 'Strict' | false | undefined) => {
        isSecure: boolean | undefined;
        strictHeader: boolean;
        domain: string;
        isSameSite: false | "Lax" | "Strict";
        path: string;
        ttl: number;
    };
    associateChartsWithUser: (sessionId: string, userId: number) => Promise<number[]>;
    createSession: (id: string, userId: number, keepSession?: boolean, type?: string) => Promise<any>;
    login: (userId: number, inputSession: {
        data?: SessionModel;
    }, keepSession?: boolean) => Promise<any>;
};
export {};
