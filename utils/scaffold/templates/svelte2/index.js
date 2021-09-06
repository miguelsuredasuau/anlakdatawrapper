const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);

module.exports = async () => {
    const packages = [
        '@babel/core@latest',
        '@babel/preset-env@latest',
        '@datawrapper/controls@latest',
        '@datawrapper/shared@latest',
        '@rollup/plugin-commonjs@latest',
        '@rollup/plugin-json@latest',
        '@rollup/plugin-node-resolve@latest',
        'babel-plugin-transform-async-to-promises@latest',
        'rollup@latest',
        'rollup-plugin-babel@latest',
        'rollup-plugin-svelte@latest',
        'rollup-plugin-terser@latest',
        'svelte@2'
    ];
    // install/update packages
    process.stdout.write('installing/updating packages...\n');
    await exec(`npm install -D ${packages.join(' ')}`);

    const pkgJSON = JSON.parse(await readFile('./package.json', 'utf-8'));
    if (!pkgJSON.scripts) pkgJSON.scripts = {};
    if (!pkgJSON.scripts.build) pkgJSON.scripts.build = 'rollup -c';
    if (!pkgJSON.scripts.dev) pkgJSON.scripts.dev = 'rollup -cw';
    await writeFile('./package.json', JSON.stringify(pkgJSON, null, 4));

    const pluginJSON = JSON.parse(await readFile('./plugin.json', 'utf-8'));
    pluginJSON.svelte = true;
    await writeFile('./plugin.json', JSON.stringify(pluginJSON, null, 4));
};
