const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);
const sortPackageJson = require('../../shared/sortPackageJson');

module.exports = async () => {
    const pkgJSON = JSON.parse(await readFile('./package.json', 'utf-8'));
    if (!pkgJSON.author) pkgJSON.author = 'Datawrapper GmbH';
    if (!pkgJSON.repository) {
        const { stdout } = await exec('git remote get-url origin');
        pkgJSON.repository = {
            type: 'git',
            url: stdout.trim()
        };
    }
    await writeFile('./package.json', JSON.stringify(sortPackageJson(pkgJSON), null, 4) + '\n');
};
