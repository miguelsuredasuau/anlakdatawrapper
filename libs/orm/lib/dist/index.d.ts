import { Config } from '@datawrapper/backend-utils';
import type { DB } from './dbTypes';
export { default as SQ } from 'sequelize';
export type { DB };
export * from './models/allModelTypes';
export declare const initORM: (config: Config) => Promise<{
    db: DB;
    registerPlugins: (logger?: {
        info(message: string): void;
    } | undefined) => Promise<void>;
}>;
