const baseConfig = require('./config.local.js');

module.exports = {
    ...baseConfig,
    plugins: {
        'api-v1': {},
        river: {}
    }
};
