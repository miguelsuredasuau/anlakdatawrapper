module.exports = {
    env: {
        node: true
    },
    overrides: [
        {
            files: ['src/**/*.test.*'],
            env: {
                mocha: true
            },
            globals: {
                expect: true
            }
        }
    ]
};
