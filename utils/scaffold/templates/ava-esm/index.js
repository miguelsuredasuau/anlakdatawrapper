const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);

module.exports = async () => {
    const packages = ['ava@2', 'esm@latest', 'browser-env@latest'];
    // install/update packages
    process.stdout.write('installing/updating packages...\n');
    await exec(`npm install -D ${packages.join(' ')}`);

    const pkgJSON = JSON.parse(await readFile('./package.json', 'utf-8'));
    if (!pkgJSON.scripts) pkgJSON.scripts = {};

    pkgJSON.scripts.test = 'ava --verbose';
    if (!pkgJSON.scripts['test:watch']) pkgJSON.scripts['test:watch'] = 'ava --watch';
    if (!pkgJSON.scripts.prepublishOnly) pkgJSON.scripts.prepublishOnly = 'npm test';
    pkgJSON.ava = {
        snapshotDir: './test/__SNAPSHOTS__',
        require: ['esm', './test/helpers/setup-browser-env.js'],
        helpers: ['**/helpers/**/*', '**/fixtures/**/*']
    };
    await writeFile('./package.json', JSON.stringify(pkgJSON, null, 4));
};
