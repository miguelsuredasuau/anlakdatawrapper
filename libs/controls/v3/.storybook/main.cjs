const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
    webpackFinal: async (config, { configType }) => {
        // Serve icon assets as static files (used by IconDisplay)
        config.plugins.push(
            new CopyPlugin({
                patterns: [{ from: './node_modules/@datawrapper/icons/build', to: 'lib/icons' }]
            })
        );

        return config;
    }
};
