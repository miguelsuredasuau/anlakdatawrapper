import type { Sequelize } from 'sequelize';
import type * as rawModels from './models/allModels';
import type { InferModelName } from './utils/wrap';

type RawModels = typeof rawModels;

export type DB = Sequelize & {
    models: {
        [key in keyof RawModels as InferModelName<RawModels[key]>]: RawModels[key];
    };
};
