const CopyPlugin = require('copy-webpack-plugin');

// Custom Webpack config, used by Storybook's internal bundling
module.exports = async ({ config }) => {
    // Webpack applies rules to *.mjs files that are stricter than Node's own rules.
    // To prevent problems with external libs (particularly @datawrapper/chart-core),
    // we force Webpack to treat *.mjs the same way as "normal" JS files:
    config.module.rules.push({
        test: /\.mjs$/,
        type: 'javascript/auto'
    });

    // Serve icon assets as static files (used by IconDisplay)
    config.plugins.push(
        new CopyPlugin({
            patterns: [{ from: './node_modules/@datawrapper/icons/build', to: 'lib/icons' }]
        })
    );

    return config;
};
