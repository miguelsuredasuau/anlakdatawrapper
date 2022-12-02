import type { Sequelize } from 'sequelize';
export type ORM = {
    db: Omit<Sequelize, 'models'>;
    chartIdSalt: string | undefined;
    hashPublishing: string | undefined;
};
type InitializerParams<TModelName> = {
    initOptions: {
        modelName: TModelName;
        sequelize: ORM['db'] & {
            models: Record<never, never>;
        };
    };
    config: {
        chartIdSalt: string | undefined;
        hashPublishing: string | undefined;
    };
};
type Initializer<TModelName extends string, TModel> = (params: InitializerParams<TModelName>) => TModel;
export type ExportedLite<TModelName extends string, TModel> = TModel & {
    dwORM$modelName?: TModelName;
};
type AnyExportedLite = ExportedLite<string, unknown>;
export type InferModelName<TExported extends AnyExportedLite> = NonNullable<TExported['dwORM$modelName']>;
type InferModel<TExported extends AnyExportedLite> = TExported extends ExportedLite<any, infer UModel> ? UModel : never;
export declare const createExports: <TModelName extends string>(modelName: TModelName) => <TModel>() => ExportedLite<TModelName, TModel>;
export declare const ensureModelInitialized: <TExported extends {
    dwORM$modelName?: string;
}>(exportedLite: TExported) => Promise<void>;
export declare const getRawModelClass: <TExported extends {
    dwORM$modelName?: string;
}>(exportedLite: TExported) => InferModel<TExported>;
export declare const setInitializer: <TExported extends {
    dwORM$modelName?: string;
}>(exportedLite: TExported, initializer: Initializer<InferModelName<TExported>, InferModel<TExported>>) => void;
export declare const setInitializerParams: <TExported extends {
    dwORM$modelName?: string;
}>(exportedLite: TExported, orm: ORM) => void;
export {};
