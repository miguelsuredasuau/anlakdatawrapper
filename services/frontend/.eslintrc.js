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
            },
            rules: {
                'no-unused-expressions': 'off'
            }
        },
        {
            files: ['src/views/_partials/controls/CodeMirrorInput.svelte'],
            parserOptions: {
                // CodeMirrorInput uses dynamic import(), which is a ES 2020 feature.
                // It is save to use here because this is not customer-facing code.
                ecmaVersion: 2020
            }
        }
    ]
};
