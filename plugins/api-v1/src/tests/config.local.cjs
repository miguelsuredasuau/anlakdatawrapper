const baseConfig = require('../../../../services/api/test/config.local.js');

module.exports = {
    ...baseConfig,
    plugins: {
        'api-v1': {}
    }
};
