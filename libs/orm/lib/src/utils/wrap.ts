// This low-level module violates type checks on purpose;
// it would be unreasonably difficult to implement it with strict type checking.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import type { Sequelize } from 'sequelize';

export type ORM = {
    db: Omit<Sequelize, 'models'>;
    chartIdSalt: string | undefined;
    hashPublishing: string | undefined;
};

type InitializerParams<TModelName> = {
    initOptions: {
        modelName: TModelName;
        sequelize: ORM['db'] & { models: Record<never, never> };
    };
    config: {
        chartIdSalt: string | undefined;
        hashPublishing: string | undefined;
    };
};

type Initializer<TModelName extends string, TModel> = (
    params: InitializerParams<TModelName>
) => TModel;

type Target<TModelName extends string, TModel> = {
    new (): unknown;
    ensureModelInitialized(): Promise<void>;
    getRawModelClass(): TModel;
    setInitializer(initializer: Initializer<TModelName, TModel>): void;
    setInitializerParams(orm: ORM): void;
};

type InternalExtensions<TModelName extends string, TModel> = {
    [key in keyof Target<TModelName, TModel> as `dwORM$${key}`]: Target<TModelName, TModel>[key];
};

export type ExportedLite<TModelName extends string, TModel> = TModel & {
    dwORM$modelName?: TModelName;
};

type AnyExportedLite = ExportedLite<string, unknown>;

export type InferModelName<TExported extends AnyExportedLite> = NonNullable<
    TExported['dwORM$modelName']
>;

type InferModel<TExported extends AnyExportedLite> = TExported extends ExportedLite<
    any,
    infer UModel
>
    ? UModel
    : never;

type Exported<TModelName extends string, TModel> = ExportedLite<TModelName, TModel> &
    InternalExtensions<TModelName, TModel>;

type InferExported<TExported extends AnyExportedLite> = Exported<
    InferModelName<TExported>,
    InferModel<TExported>
>;

const simpleProxyHandler: ProxyHandler<Target<any, any>> = {};
for (const key of [
    'apply',
    'construct',
    'defineProperty',
    'deleteProperty',
    'get',
    'getOwnPropertyDescriptor',
    'getPrototypeOf',
    'has',
    'isExtensible',
    'ownKeys',
    'preventExtensions',
    'set',
    'setPrototypeOf'
] as const) {
    simpleProxyHandler[key] = ((target: any, ...rest: any[]) =>
        (Reflect[key] as any)(target.getRawModelClass(), ...rest)) as any;
}

const proxyHandler: ProxyHandler<Target<any, any>> = {
    ...simpleProxyHandler,
    get(target, prop, ...rest) {
        if (!(prop as string)?.startsWith?.('dwORM$')) {
            return simpleProxyHandler.get!(target, prop, ...rest);
        }

        switch (prop) {
            case 'dwORM$ensureModelInitialized':
                return target.ensureModelInitialized;
            case 'dwORM$getRawModelClass':
                return target.getRawModelClass;
            case 'dwORM$setInitializer':
                return target.setInitializer;
            case 'dwORM$setInitializerParams':
                return target.setInitializerParams;
            default:
                throw new Error(`Unsupported property name '${String(prop)}'`);
        }
    },
    set(target, prop, value, receiver) {
        if (!(prop as string)?.startsWith('dwORM$')) {
            return simpleProxyHandler.set!(target, prop, value, receiver);
        }

        throw new Error(`Unsupported property name '${String(prop)}'`);
    }
};

const createLazyModel = <TModelName extends string, TModel>(modelName: TModelName) => {
    let modelInitializer: Initializer<TModelName, TModel> | undefined = undefined;
    let initializerParams: InitializerParams<TModelName> | undefined = undefined;
    let Model: TModel | undefined = undefined;
    let isInitializing = false;
    const setInitializer = (inputModelInitializer: Initializer<TModelName, TModel>) => {
        if (modelInitializer) {
            throw new Error('Model initializer is already set');
        }

        modelInitializer = inputModelInitializer;
    };
    const setInitializerParams = ({ db, ...rest }: ORM) => {
        if (initializerParams) {
            throw new Error('Model initializer arguments are already set');
        }

        initializerParams = {
            initOptions: {
                sequelize: db as InitializerParams<TModelName>['initOptions']['sequelize'],
                modelName
            },
            config: rest
        };
    };
    const ensureModelInitialized = () => {
        if (Model) {
            return;
        }

        if (!modelInitializer) {
            throw new Error('Model initializer is not set');
        }

        if (!initializerParams) {
            throw new Error('Model initializer arguments are not set');
        }

        if (isInitializing) {
            throw new Error('Recursive initialization');
        }
        try {
            isInitializing = true;
            Model = modelInitializer(initializerParams);
        } finally {
            isInitializing = false;
        }
    };
    const getRawModelClass = (): TModel => {
        ensureModelInitialized();
        return Model!;
    };

    return {
        ensureModelInitialized,
        getRawModelClass,
        setInitializer,
        setInitializerParams
    };
};

export const createExports =
    <TModelName extends string>(modelName: TModelName) =>
    <TModel>(): ExportedLite<TModelName, TModel> => {
        const lazyModel = Object.assign(function () {
            // It has to be a function so that proxy will handle function calls
            throw new Error('Should never happen');
        }, createLazyModel<TModelName, TModel>(modelName));

        return new Proxy(lazyModel, proxyHandler as any) as any as ExportedLite<TModelName, TModel>;
    };

export const ensureModelInitialized = <TExported extends AnyExportedLite>(
    exportedLite: TExported
) => {
    return (exportedLite as InferExported<TExported>).dwORM$ensureModelInitialized();
};

export const getRawModelClass = <TExported extends AnyExportedLite>(exportedLite: TExported) => {
    return (exportedLite as InferExported<TExported>).dwORM$getRawModelClass();
};

export const setInitializer = <TExported extends AnyExportedLite>(
    exportedLite: TExported,
    initializer: Initializer<InferModelName<TExported>, InferModel<TExported>>
) => {
    return (exportedLite as InferExported<TExported>).dwORM$setInitializer(initializer);
};

export const setInitializerParams = <TExported extends AnyExportedLite>(
    exportedLite: TExported,
    orm: ORM
) => {
    return (exportedLite as InferExported<TExported>).dwORM$setInitializerParams(orm);
};
