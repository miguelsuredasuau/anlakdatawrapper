import type { Config } from './configTypes';
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
declare function findConfigPath(): string;
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
declare function requireConfig(): Config;
declare const _default: {
    findConfigPath: typeof findConfigPath;
    requireConfig: typeof requireConfig;
};
export = _default;
