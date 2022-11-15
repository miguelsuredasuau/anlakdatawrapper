import type { pino } from 'pino';
import type {
    ApplicationState as HapiApplicationState,
    Request as HapiRequest,
    RequestAuth as HapiRequestAuth,
    Server as HapiServer
} from 'hapi';
import type { FeatureFlag } from './featureFlagTypes';
import type { User } from './userModelTypes';
import type { Visualization } from './visualizationTypes';
import type { translate } from './l10n';

export type RequestAuth = HapiRequestAuth & {
    artifacts: User | null;
};

export type Request = HapiRequest & {
    auth: RequestAuth;
};

type ApplicationState = HapiApplicationState & {
    visualizations: Map<string, Visualization>;
    featureFlags: Map<string, FeatureFlag>;
};

export type Server = HapiServer & {
    app: ApplicationState;
    logger: pino.Logger;
    methods: {
        computeFileHash: (file: string) => Promise<string>;
        computeFileGlobHash: (fileGlob: string) => Promise<string>;
        config: (key?: string) => Record<string, unknown>; // TODO Return specific config object based on key.
        getModel: <T>(name: string) => T; // TODO Return specific model based on name.
        translate: typeof translate;
    };
};
