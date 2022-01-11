module.exports = {
    env: {
        browser: true,
        node: true
    },
    overrides: [
        {
            files: ['src/views/_partials/svelte2/Svelte2Wrapper.element.svelte'],
            settings: {
                'svelte3/compiler-options': {
                    customElement: true
                }
            }
        },
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
