module.exports = {
    env: {
        node: true,
        browser: false
    },
    rules: {
        'compat/compat': 0
    },
    overrides: [
        {
            files: ['test/**/*.test.*'],
            env: {
                mocha: true
            },
            globals: {
                expect: true
            }
        }
    ]
};
