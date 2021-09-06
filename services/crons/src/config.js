const fs = require('fs');
const path = require('path');

const cfgPath = [path.join(process.cwd(), 'config.js'), '/etc/datawrapper/config.js'].reduce(
    (path, test) => {
        return path || (fs.existsSync(test) ? test : false);
    },
    ''
);

if (!fs.existsSync(cfgPath)) {
    console.error('Error: could not find config.js!\n');
    console.error(' in path ', process.cwd(), '/', __dirname);
    process.exit(1);
}

module.exports = require(cfgPath);
