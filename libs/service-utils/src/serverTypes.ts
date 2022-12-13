import type { pino } from 'pino';
import type {
    ServerApplicationState as HapiApplicationState,
    Request as HapiRequest,
    RequestAuth as HapiRequestAuth,
    Server as HapiServer,
    ReqRef,
    ReqRefDefaults,
    ServerRoute,
    MergeRefs,
    ResponseToolkit,
    Lifecycle,
    RouteOptions
} from '@hapi/hapi';
import type { ChartModel, DB, SessionModel, ThemeModel, UserModel } from '@datawrapper/orm';
import type { models } from '@datawrapper/orm/db';
import type { FeatureFlag } from './featureFlagTypes';
import type { Visualization } from './visualizationTypes';
import type { translate } from './l10n';
import type { Config, ServiceEventEmitter } from '@datawrapper/backend-utils';

type Extend<TOriginal, TExtension> = Omit<TOriginal, keyof TExtension> & TExtension;

export type RequestAuth = Extend<
    HapiRequestAuth,
    {
        artifacts: UserModel | null;
        credentials: {
            data: SessionModel | null;
            session: string | null;
        };
    }
>;

export type Request<TServer extends Server = Server, Refs extends ReqRef = ReqRefDefaults> = Extend<
    HapiRequest<Refs>,
    {
        auth: RequestAuth;
        server: TServer;
    }
>;

type ApplicationState = Extend<
    HapiApplicationState,
    {
        visualizations: Map<string, Visualization>;
        featureFlags: Map<string, FeatureFlag>;
    }
>;

type DBModels = DB['models'];

export type Server = Extend<
    HapiServer,
    {
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
    }
>;

type RouteMethod<TServer extends Server> = {
    <Refs extends ReqRef = ReqRefDefaults>(
        route: Extend<
            ServerRoute<Refs>,
            {
                options: Extend<
                    RouteOptions<Refs>,
                    {
                        handler(
                            this: MergeRefs<Refs>['Bind'],
                            request: Request<TServer, Refs>,
                            h: ResponseToolkit<Refs>,
                            err?: Error
                        ): Lifecycle.ReturnValue<Refs>;
                    }
                >;
            }
        >
    ): void;
};

type ChartAction = {
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

type ServerEventName = 'CHART_EXPORT' | 'CHART_EXPORT_STREAM';
type ServerEvents = {
    [Key in ServerEventName]: Key;
};

export type APIServer = Extend<
    Server,
    {
        app: Extend<
            Server['app'],
            {
                event: ServerEvents;
                events: ServiceEventEmitter<ServerEventName>;
                exportFormats: Set<string>;
            }
        >;
        route: RouteMethod<APIServer>;
    }
>;

export type FrontendServer = Extend<
    Server,
    {
        methods: Extend<
            Server['methods'],
            {
                registerChartAction(
                    handler: (params: {
                        request: Request<FrontendServer>;
                        chart: ChartModel;
                        theme: ThemeModel;
                    }) => Promise<ChartAction | undefined>
                ): void;
            }
        >;
        route: RouteMethod<FrontendServer>;
    }
>;

type ServerPlugin<TServer extends Server, TConfig> = {
    register(
        server: TServer,
        options: {
            config: TConfig;
            models: typeof models;
        }
    ): Promise<void>;
};

export type APIServerPlugin<TConfig = never> = ServerPlugin<APIServer, TConfig>;
export type FrontendServerPlugin<TConfig = never> = ServerPlugin<FrontendServer, TConfig>;
