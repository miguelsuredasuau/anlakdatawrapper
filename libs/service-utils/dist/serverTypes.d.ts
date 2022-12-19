import type { Config, ServiceEventEmitter } from '@datawrapper/backend-utils';
import type { ChartModel, DB, SessionModel, ThemeModel, UserModel } from '@datawrapper/orm';
import type { models } from '@datawrapper/orm/db';
import type { ServerApplicationState as HapiApplicationState, Request as HapiRequest, RequestAuth as HapiRequestAuth, Server as HapiServer, ReqRef, ReqRefDefaults, ServerRoute, MergeRefs, ResponseToolkit, Lifecycle, RouteOptions } from '@hapi/hapi';
import type { pino } from 'pino';
import type { FeatureFlag } from './featureFlagTypes';
import type { JobsHelper } from './jobsHelper';
import type { translate } from './l10n';
import type { Visualization } from './visualizationTypes';
declare type Extend<TOriginal, TExtension> = Omit<TOriginal, keyof TExtension> & TExtension;
export declare type RequestAuth = Extend<HapiRequestAuth, {
    artifacts: UserModel | null;
    credentials: {
        data: SessionModel | null;
        session: string | null;
    };
}>;
export declare type Request<TServer extends Server = Server, Refs extends ReqRef = ReqRefDefaults> = Extend<HapiRequest<Refs>, {
    auth: RequestAuth;
    server: TServer;
}>;
declare type ApplicationState = Extend<HapiApplicationState, {
    visualizations: Map<string, Visualization>;
    featureFlags: Map<string, FeatureFlag>;
}>;
declare type DBModels = DB['models'];
export declare type Server = Extend<HapiServer, {
    app: ApplicationState;
    logger: pino.Logger;
    methods: {
        computeFileHash(file: string): Promise<string>;
        computeFileGlobHash(fileGlob: string): Promise<string>;
        config(): Config;
        config<TKey extends keyof Config>(key: TKey): Config[TKey];
        getJobsHelper(): JobsHelper;
        getModel<TKey extends keyof DBModels>(name: TKey): DBModels[TKey];
        getScopes(admin?: boolean): string[];
        translate: typeof translate;
    };
}>;
declare type RouteMethod<TServer extends Server> = {
    <Refs extends ReqRef = ReqRefDefaults>(route: Extend<ServerRoute<Refs>, {
        options: Extend<RouteOptions<Refs>, {
            handler(this: MergeRefs<Refs>['Bind'], request: Request<TServer, Refs>, h: ResponseToolkit<Refs>, err?: Error): Lifecycle.ReturnValue<Refs>;
        }>;
    }>): void;
};
declare type ChartAction = {
    id: string;
    title: string;
    icon: string;
    mod: {
        id: string;
        src: string;
        css: string;
        data: Record<string, unknown>;
    };
};
declare type ServerEventName = 'CHART_EXPORT' | 'CHART_EXPORT_STREAM';
declare type ServerEvents = {
    [Key in ServerEventName]: Key;
};
export declare type APIServer = Extend<Server, {
    app: Extend<Server['app'], {
        event: ServerEvents;
        events: ServiceEventEmitter<ServerEventName>;
        exportFormats: Set<string>;
    }>;
    route: RouteMethod<APIServer>;
}>;
export declare type FrontendServer = Extend<Server, {
    methods: Extend<Server['methods'], {
        registerChartAction(handler: (params: {
            request: Request<FrontendServer>;
            chart: ChartModel;
            theme: ThemeModel;
        }) => Promise<ChartAction | undefined>): void;
    }>;
    route: RouteMethod<FrontendServer>;
}>;
declare type ServerPlugin<TServer extends Server, TConfig> = {
    register(server: TServer, options: {
        config: TConfig;
        models: typeof models;
    }): Promise<void>;
};
export declare type APIServerPlugin<TConfig = never> = ServerPlugin<APIServer, TConfig>;
export declare type FrontendServerPlugin<TConfig = never> = ServerPlugin<FrontendServer, TConfig>;
export {};
