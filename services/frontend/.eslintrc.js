module.exports = {
    overrides: [
        {
            files: ['src/views/_partials/svelte2/Svelte2Wrapper.element.svelte'],
            settings: {
                'svelte3/compiler-options': {
                    customElement: true
                }
            }
        }
    ]
};
