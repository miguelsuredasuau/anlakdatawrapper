const baseConfig = require('./config.docker.js');

module.exports = {
    ...baseConfig,
    plugins: {
        'api-v1': {},
        river: {}
    }
};
