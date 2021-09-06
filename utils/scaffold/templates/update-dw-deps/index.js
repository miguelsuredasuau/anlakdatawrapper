const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const compareVersions = require('compare-versions');
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);
const { green, white, red } = require('chalk');
const readline = require('readline-promise').default.createInterface({
    input: process.stdin,
    output: process.stdout
});

module.exports = async () => {
    // install/update packages
    const pkgJSON = JSON.parse(await readFile('./package.json', 'utf-8'));
    const pkgLockJSON = JSON.parse(await readFile('./package-lock.json', 'utf-8'));
    const isDwDep = d =>
        d.startsWith('@datawrapper/') && (pkgJSON.dependencies[d] || pkgJSON.devDependencies[d]);
    const dwDeps = [];

    Object.keys(pkgLockJSON.dependencies || {})
        .filter(isDwDep)
        .forEach(pkg =>
            dwDeps.push({
                pkg,
                dev: pkgLockJSON.dependencies[pkg].dev,
                version: pkgLockJSON.dependencies[pkg].version
            })
        );

    let foundNew = false;

    const { stdout } = await exec('npm outdated --json || true');
    const outdated = JSON.parse(stdout);

    for (let i = 0; i < dwDeps.length; i++) {
        const { pkg, version, dev } = dwDeps[i];
        // check current version
        const newest = outdated[pkg]
            ? compareVersions(outdated[pkg].latest, outdated[pkg].wanted) > 0
                ? outdated[pkg].latest
                : outdated[pkg].wanted
            : null;

        if (!outdated[pkg] || !compareVersions(newest, version)) {
            process.stdout.write(`${green('✔')} ${pkg} is up-to-date\n`);
        } else {
            process.stdout.write(
                green`☺  New version available for ${white(pkg)} (${version} --> ${white(
                    newest
                )})\n`
            );
            pkgJSON[dev ? 'devDependencies' : 'dependencies'][pkg] = `^${newest}`;
            foundNew = true;
        }
    }
    if (foundNew) {
        process.stdout.write(`\n${green('✔')} Updated package.json\n`);
        await writeFile('./package.json', JSON.stringify(pkgJSON, null, 4));
        const answer = await readline.questionAsync(
            white('Do you want to run ' + red('npm install') + ' now (y/n)? ')
        );
        if (answer === 'y') await exec('npm install');
    }
    readline.close();
};
