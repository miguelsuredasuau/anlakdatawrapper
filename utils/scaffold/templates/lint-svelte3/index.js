const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);

module.exports = async () => {
    const packages = [
        'prettier@2',
        'healthier@4',
        'babel-eslint@latest',
        'eslint@latest',
        'eslint-plugin-svelte3'
    ];
    // install/update packages
    process.stdout.write('installing/updating packages...\n');
    await exec(`npm install -D ${packages.join(' ')}`);

    const pkgJSON = JSON.parse(await readFile('./package.json', 'utf-8'));
    if (!pkgJSON.scripts) pkgJSON.scripts = {};
    if (!pkgJSON.scripts.lint)
        pkgJSON.scripts.lint =
            "prettier --check 'src/**/*.{js,svelte}' && healthier 'src/**/*.{js,svelte}'";
    if (!pkgJSON.scripts.format) pkgJSON.scripts.format = "prettier 'src/**/*.{js,svelte}' --write";
    pkgJSON.prettier = {
        arrowParens: 'avoid',
        printWidth: 100,
        semi: true,
        singleQuote: true,
        tabWidth: 4,
        trailingComma: 'none'
    };
    pkgJSON.eslintConfig = {
        parser: 'babel-eslint',
        plugins: ['svelte3'],
        overrides: [
            {
                files: ['**/*.svelte'],
                processor: 'svelte3/svelte3',
                rules: {
                    'import/first': 'off'
                }
            }
        ],
        rules: {
            'no-console': [
                'error',
                {
                    allow: ['warn', 'error']
                }
            ],
            camelcase: [
                'warn',
                {
                    ignoreDestructuring: true,
                    properties: 'never'
                }
            ],
            'prefer-const': 'off'
        }
    };
    await writeFile('./package.json', JSON.stringify(pkgJSON, null, 4));
};
