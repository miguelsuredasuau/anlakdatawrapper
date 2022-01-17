const baseConfig = require('../../../../services/api/test/config.docker.js');

module.exports = {
    ...baseConfig,
    plugins: {
        'api-v1': {}
    }
};
