"use strict";
const util_1 = require("util");
const child_process_1 = require("child_process");
const exec = (0, util_1.promisify)(child_process_1.exec);
module.exports = async function getGitRevision() {
    if (process.env['COMMIT']) {
        return process.env['COMMIT'];
    }
    try {
        return (await exec('git rev-parse HEAD', { timeout: 1000 })).stdout.trim();
    }
    catch (e) {
        process.stderr.write('Failed to get Git revision, because the app is probably not checked out from Git. ' +
            'No Sentry release or log VERSION will be set.');
        return undefined;
    }
};
