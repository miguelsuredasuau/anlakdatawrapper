const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);
const sortPackageJson = require('../../shared/sortPackageJson');

module.exports = async () => {
    // install/update husky
    const packages = ['husky@4'];
    process.stdout.write('installing/updating packages...\n');
    await exec(`npm install -D ${packages.join(' ')}`);
    // set pre-commit hook
    const pkgJSON = JSON.parse(await readFile('./package.json', 'utf-8'));
    if (!pkgJSON.husky) pkgJSON.husky = {};
    if (!pkgJSON.husky.hooks) pkgJSON.husky.hooks = {};
    const preCommitHook = 'lint-staged && git rev-parse HEAD > .githead && git add .githead';
    if (!pkgJSON.husky.hooks['pre-commit']) pkgJSON.husky.hooks['pre-commit'] = preCommitHook;
    else if (pkgJSON.husky.hooks['pre-commit'] !== preCommitHook) {
        console.warn('Warning: A differerent pre-commit hook was already defined');
        if (pkgJSON.husky.hooks['pre-commit'].startsWith('lint-staged && ')) {
            pkgJSON.husky.hooks['pre-commit'] +=
                ' && git rev-parse HEAD > .githead && git add .githead';
            process.stdout.write(
                `update pre-commit hook to ${pkgJSON.husky.hooks['pre-commit']} \n`
            );
        }
    }
    await writeFile('./package.json', JSON.stringify(sortPackageJson(pkgJSON), null, 4) + '\n');
};
