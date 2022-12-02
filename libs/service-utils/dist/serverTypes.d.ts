import type { pino } from 'pino';
import type { ApplicationState as HapiApplicationState, Request as HapiRequest, RequestAuth as HapiRequestAuth, Server as HapiServer } from 'hapi';
import type { DB, UserModel } from '@datawrapper/orm';
import type { FeatureFlag } from './featureFlagTypes';
import type { Visualization } from './visualizationTypes';
import type { translate } from './l10n';
import type { Config } from '@datawrapper/backend-utils';
export declare type RequestAuth = HapiRequestAuth & {
    artifacts: UserModel | null;
};
export declare type Request = HapiRequest & {
    auth: RequestAuth;
    server: Server;
};
declare type ApplicationState = HapiApplicationState & {
    visualizations: Map<string, Visualization>;
    featureFlags: Map<string, FeatureFlag>;
};
declare type DBModels = DB['models'];
export declare type Server = HapiServer & {
    app: ApplicationState;
    logger: pino.Logger;
    methods: {
        computeFileHash(file: string): Promise<string>;
        computeFileGlobHash(fileGlob: string): Promise<string>;
        config(): Config;
        config<TKey extends keyof Config>(key: TKey): Config[TKey];
        getModel<TKey extends keyof DBModels>(name: TKey): DBModels[TKey];
        getScopes(admin?: boolean): string[];
        translate: typeof translate;
    };
};
export {};
