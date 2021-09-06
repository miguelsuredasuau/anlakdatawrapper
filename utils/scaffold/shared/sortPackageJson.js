/**
 * re-orders the keys in a package.json object
 */
module.exports = function sortPackageJson(pkgJson) {
    const keyOrder = [
        'name',
        'version',
        'description',
        'keywords',
        'homepage',
        'bugs',
        'license',
        'author',
        'publishConfig',
        'contributors',
        'files',
        'main',
        'browser',
        'bin',
        'scripts',
        'repository',
        'config',
        'directories',
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'bundledDependencies',
        'optionalDependencies'
    ];
    // create a temporary map to reduce computing overhead in sort function
    const sortIndex = Object.keys(pkgJson).reduce((sortIndex, key) => {
        sortIndex[key] = keyOrder.indexOf(key);
        if (sortIndex[key] < 0) sortIndex[key] = 999;
        return sortIndex;
    }, {});

    const sortedPackageJSON = {};
    Object.keys(pkgJson)
        .sort((a, b) => {
            return sortIndex[a] - sortIndex[b];
        })
        .forEach(key => {
            sortedPackageJSON[key] = pkgJson[key];
        });

    return sortedPackageJSON;
};
