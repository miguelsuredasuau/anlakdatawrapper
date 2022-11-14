import { promisify } from 'util';
import { exec as execWithCallback } from 'child_process';

const exec = promisify(execWithCallback);

export = async function getGitRevision(): Promise<string | undefined> {
    if (process.env['COMMIT']) {
        return process.env['COMMIT'];
    }
    try {
        return (await exec('git rev-parse HEAD', { timeout: 1000 })).stdout.trim();
    } catch (e) {
        process.stderr.write(
            'Failed to get Git revision, because the app is probably not checked out from Git. ' +
                'No Sentry release or log VERSION will be set.'
        );
        return undefined;
    }
};
