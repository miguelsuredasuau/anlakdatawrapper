"use strict";
const path_1 = require("path");
module.exports = function joinSafe(rootDir, ...args) {
    const file = (0, path_1.join)(rootDir, ...args);
    if (!file.startsWith(rootDir))
        throw new Error('invalid path');
    return file;
};
