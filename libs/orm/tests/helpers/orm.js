const { initORM } = require('../../index');
const { requireConfig } = require('@datawrapper/backend-utils');

const config = requireConfig();

exports.init = async function init() {
    const { db } = await initORM(config);
    return db;
};

exports.initWithPlugins = async function initWithPlugins() {
    const { db, registerPlugins } = await initORM(config);
    return { db, registerPlugins };
};

exports.sync = async function sync() {
    const { db } = await initORM(config);
    await db.sync();
};
