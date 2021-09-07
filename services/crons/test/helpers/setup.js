const ORM = require('@datawrapper/orm');
const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const config = requireConfig();

module.exports.setup = async function () {
    await ORM.init(config);
    const models = require('@datawrapper/orm/models');
    return models;
};
