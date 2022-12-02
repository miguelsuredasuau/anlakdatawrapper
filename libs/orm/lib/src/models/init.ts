import type { DB } from '../dbTypes';
import { ensureModelInitialized, setInitializerParams, type ORM } from '../utils/wrap';
import * as models from './allModels';
import * as associations from './assoc';

const modelsList = Object.values(models);
const associationsList = Object.values(associations);

export const initModels = (orm: ORM) => {
    for (const model of modelsList) {
        setInitializerParams(model, orm);
    }

    for (const model of modelsList) {
        ensureModelInitialized(model);
    }

    for (const association of associationsList) {
        association();
    }

    return orm.db as DB;
};
