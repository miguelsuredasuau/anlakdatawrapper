const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

module.exports = async function getGitRevision() {
    if (process.env.COMMIT) {
        return process.env.COMMIT;
    }
    try {
        return (await exec('git rev-parse HEAD', { timeout: 1000 })).stdout;
    } catch (e) {
        process.stderr.write(
            'Failed to get Git revision, because the app is probably not checked out from Git. ' +
                'No Sentry release or log VERSION will be set.'
        );
        return undefined;
    }
};
