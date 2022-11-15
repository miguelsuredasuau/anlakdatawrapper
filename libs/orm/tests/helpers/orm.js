const ORM = require('../../index');
const { requireConfig } = require('@datawrapper/backend-utils');

const config = requireConfig();

function init() {
    return ORM.init(config);
}

async function sync() {
    const { db } = await init();
    require('../../models');
    await db.sync();
}

module.exports = {
    init,
    sync
};
