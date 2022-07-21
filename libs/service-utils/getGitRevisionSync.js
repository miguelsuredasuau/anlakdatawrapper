const { execSync } = require('child_process');

module.exports = function getGitRevisionSync() {
    if (process.env.COMMIT) {
        return process.env.COMMIT;
    }
    try {
        return execSync('git rev-parse HEAD', { timeout: 1000, encoding: 'utf8' }).trim();
    } catch (e) {
        process.stderr.write(
            'Failed to get Git revision, because the app is probably not checked out from Git. ' +
                'No Sentry release or log VERSION will be set.'
        );
        return undefined;
    }
};
