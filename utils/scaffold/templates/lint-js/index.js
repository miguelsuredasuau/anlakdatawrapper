const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);
const { white } = require('chalk');
const readline = require('readline-promise').default.createInterface({
    input: process.stdin,
    output: process.stdout
});

module.exports = async () => {
    const packages = [
        'prettier@2',
        'healthier@4',
        'babel-eslint@latest',
        'eslint@latest',
        '@datawrapper/eslint-config',
        '@datawrapper/prettier-config'
    ];
    // install/update packages
    process.stdout.write('installing/updating packages...\n');
    await exec(`npm install -D ${packages.join(' ')}`);

    const pkgJSON = JSON.parse(await readFile('./package.json', 'utf-8'));
    if (!pkgJSON.scripts) pkgJSON.scripts = {};
    if (!pkgJSON.scripts.lint)
        pkgJSON.scripts.lint = "prettier --check 'src/**/*.js' && healthier 'src/**/*.js'";
    if (!pkgJSON.scripts.format) pkgJSON.scripts.format = "prettier 'src/**/*.js' --write";
    pkgJSON.prettier = '@datawrapper/prettier-config';
    const answer = await readline.questionAsync(
        white(
            'Which eslint config do you want to install?\n [1] general purpose eslint-config\n [2] special eslint-config for visualization plugins\n'
        )
    );
    pkgJSON.eslintConfig = {
        extends:
            answer === '2'
                ? '@datawrapper/eslint-config/chart-plugin'
                : '@datawrapper/eslint-config'
    };
    await writeFile('./package.json', JSON.stringify(pkgJSON, null, 4));
    readline.close();
};
