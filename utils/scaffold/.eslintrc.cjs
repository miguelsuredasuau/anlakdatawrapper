module.exports = {
    env: {
        node: true
    },
    overrides: [
        {
            files: ['templates/*/files/frontend/**', 'templates/*/files/**/*.{html,svelte}'],
            env: {
                node: false
            }
        }
    ]
};
