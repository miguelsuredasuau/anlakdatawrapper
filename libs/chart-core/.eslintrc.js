module.exports = {
    env: {
        browser: true,
        commonjs: true
    },
    overrides: [
        {
            files: ['*.svelte'],
            rules: {
                'svelte3-security/html-sanitize': [
                    'warn',
                    [
                        // Defaults from the root .eslintrc:
                        '__',
                        'decodeHtml',
                        'purifyHtml',
                        'purifySvg',
                        // Special function `clean()` that exists only here in chart-core:
                        'clean'
                    ]
                ]
            }
        }
    ]
};
