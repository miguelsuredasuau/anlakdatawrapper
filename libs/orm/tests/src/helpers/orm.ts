import { initORM } from '@datawrapper/orm-lib';
import { requireConfig } from '@datawrapper/backend-utils';

const config = requireConfig();

export async function init() {
    const { db } = await initORM(config);
    return db;
}

export async function initWithPlugins() {
    const { db, registerPlugins } = await initORM(config);
    return { db, registerPlugins };
}

export async function sync() {
    const { db } = await initORM(config);
    await db.sync();
}
