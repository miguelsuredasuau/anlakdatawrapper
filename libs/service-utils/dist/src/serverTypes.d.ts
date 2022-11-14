import type { pino } from 'pino';
import type { ApplicationState as HapiApplicationState, Request as HapiRequest, RequestAuth as HapiRequestAuth, Server as HapiServer } from 'hapi';
import type { Config } from './configTypes';
import type { FeatureFlag } from './featureFlagTypes';
import type { User } from './userModelTypes';
import type { Visualization } from './visualizationTypes';
import type l10n from './l10n';
export declare type RequestAuth = HapiRequestAuth & {
    artifacts: User | null;
};
export declare type Request = HapiRequest & {
    auth: RequestAuth;
};
declare type ApplicationState = HapiApplicationState & {
    visualizations: Map<string, Visualization>;
    featureFlags: Map<string, FeatureFlag>;
};
export declare type Server = HapiServer & {
    app: ApplicationState;
    logger: pino.Logger;
    methods: {
        computeFileHash: (file: string) => Promise<string>;
        computeFileGlobHash: (fileGlob: string) => Promise<string>;
        config: (key?: string) => Config;
        getModel: <T>(name: string) => T;
        translate: typeof l10n.translate;
    };
};
export {};
