"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Finds a path to the Datawrapper config file (`config.js`).
 *
 * The first existing path in this list will be used:
 * - the path read from the environment variable `DW_CONFIG_PATH`
 * - `/etc/datawrapper/config.js`
 * - `../../config.js`
 * - `./config.js`
 *
 * If no config is found, the process will exit with a non-zero exit code.
 *
 * @example
 * const { findConfigPath } = require('@datawrapper/service-utils/findConfig')
 *
 * const path = findConfigPath()
 * // -> /etc/datawrapper/config.js
 *
 * @returns {String}
 */
function findConfigPath() {
    const cwd = process.cwd();
    const paths = [
        '/etc/datawrapper/config.js',
        path_1.default.join(cwd, '../../', 'config.js'),
        path_1.default.join(cwd, 'config.js')
    ];
    if (process.env['DW_CONFIG_PATH']) {
        paths.unshift(path_1.default.resolve(process.env['DW_CONFIG_PATH']));
    }
    for (const path of paths) {
        if (fs_1.default.existsSync(path))
            return path;
    }
    process.stderr.write(`
❌ No config.js found!

Please check if there is a \`config.js\` file in either

${paths.join('\n')}
`);
    process.exit(1);
}
/**
 * Tiny wrapper around `findConfigPath` that directly `require`s the found config.
 *
 * @example
 * const { requireConfig } = require('@datawrapper/service-utils/findConfig')
 *
 * const config = requireConfig()
 *
 * @returns {Object}
 */
function requireConfig() {
    return require(findConfigPath());
}
module.exports = {
    findConfigPath,
    requireConfig
};
