const { initORM } = require('@datawrapper/orm');
const { requireConfig } = require('@datawrapper/backend-utils');
const config = requireConfig();

module.exports.setup = async function () {
    await initORM(config);
};
