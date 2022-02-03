module.exports = {
    env: {
        node: true
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
