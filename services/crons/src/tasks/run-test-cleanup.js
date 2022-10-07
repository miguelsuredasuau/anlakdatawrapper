const { db } = require('@datawrapper/orm');
const { Op } = db;
const { User, Chart, AccessToken } = require('@datawrapper/orm/models');
const got = require('got');
const {
    api: apiConfig,
    crons: { screenshots: shotConfig }
} = require('../config');
const { S3Client, ListObjectsCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { rm } = require('fs/promises');
const { join } = require('path');
const logger = require('../logger');

const API_DOMAIN =
    'http' +
    (apiConfig.https ? 's' : '') +
    '://' +
    apiConfig.subdomain +
    '.' +
    apiConfig.domain +
    '/v3/';
const E2E_MAIL = 'e2e-test@datawrapper.de';
const GRACE_TIME = 1000;
const MIN_AGE_MINUTES = 30;

const jobLogger = logger.child({ job: 'run-test-cleanup' });

jobLogger.info('Test cleanup will work on: ' + API_DOMAIN);

// to be removed if we finally find a better place to define it
const sleep = time => new Promise(res => setTimeout(res, time));

const genS3Params = shotConfig => {
    if (!shotConfig.s3) {
        return undefined;
    }

    const { s3 } = shotConfig;

    if (!s3.bucket) {
        jobLogger.info('S3 Bucket missing.');
        return undefined;
    }
    if (!s3.cleanup?.access_key_id) {
        jobLogger.info('S3 Access Key missing.');
        return undefined;
    }
    if (!s3.cleanup?.secret_access_key) {
        jobLogger.info('S3 Secret Key missing.');
        return undefined;
    }

    return {
        bucket: s3.bucket,
        path: s3.path || false,
        s3Config: {
            apiVersion: '2006-03-01',
            region: s3.cleanup.region || 'eu-central-1',
            credentials: {
                accessKeyId: s3.cleanup.access_key_id,
                secretAccessKey: s3.cleanup.secret_access_key
            },
            // Needed for minio compatibility:
            forcePathStyle: true,
            signatureVersion: 'v4',
            ...(s3.cleanup.endpoint && { endpoint: s3.cleanup.endpoint })
        }
    };
};

const genFileParams = shotConfig => {
    if (shotConfig.file && shotConfig.file.path) {
        return { path: shotConfig.file.path };
    }
    return undefined;
};

const s3Params = genS3Params(shotConfig);
if (s3Params) {
    jobLogger.info('Successfully configured to remove S3 screenshots.');
} else {
    jobLogger.info('Not configured to remove S3 screenshots.');
}

const fileParams = genFileParams(shotConfig);
if (fileParams) {
    jobLogger.info('Successfully configured to remove file screenshots.');
} else {
    jobLogger.info('Not configured to remove file screenshots.');
}

const getTestUserID = async mail => {
    const testUser = await User.findOne({
        attributes: ['id'],
        where: {
            email: mail
        }
    });

    return testUser?.id;
};

const getTestUserCharts = async uid => {
    //TIMESTAMPDIFF(MINUTE, ageColumn, NOW());
    const chartAgeMinute = () =>
        db.fn('TIMESTAMPDIFF', db.literal('MINUTE'), db.col('created_at'), db.fn('NOW'));

    const charts = await Chart.findAll({
        attributes: ['id'],
        where: {
            [Op.and]: [{ author_id: uid }, db.where(chartAgeMinute(), Op.gt, MIN_AGE_MINUTES)]
        }
    });

    return charts.map(chart => chart.id);
};

const getAPIToken = async uid => {
    const token = await AccessToken.findOne({
        attributes: ['token'],
        where: {
            user_id: uid,
            data: { comment: 'default' }
        }
    });

    return token?.token;
};

const unPublish = async (chartID, token) => {
    try {
        await got({
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: 'POST',
            url: `${API_DOMAIN}charts/${chartID}/unpublish` // Domain already has trailing slash.
        });
        jobLogger.info(`${chartID}: Successfully unpublished chart.`);
    } catch (e) {
        jobLogger.error(`${chartID}: Failed to unpublish chart.`);
        throw e;
    }
};

const setChartsDeleted = async ids => {
    await Chart.update(
        {
            deleted: 1
        },
        {
            where: {
                id: ids
            }
        }
    );
};

const deleteAssets = async (chartID, token) => {
    try {
        await got({
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: 'DELETE',
            url: `${API_DOMAIN}charts/${chartID}/assets` // Domain already has trailing slash.
        });
        jobLogger.info(`${chartID}: Successfully deleted chart assets.`);
    } catch (e) {
        jobLogger.error(`${chartID}: Failed to delete chart assets.`);
        throw e;
    }
};

const deleteS3Screenshots = async (chartID, s3Client, bucket, prefix, hash) => {
    // we should not allow removal without hash, it could easiely remove unrelated things
    if (!hash) {
        throw new Error('Not removing files from S3 without prefixed hash');
    }

    const listCmd = new ListObjectsCommand({
        Bucket: bucket,
        Prefix: `${prefix ? prefix + '/' : ''}${chartID}/${hash}/`
    });

    const listResp = await s3Client.send(listCmd);
    const paths = listResp.Contents?.map(c => c.Key);

    if (!paths?.length) {
        // nothing to delete
        return;
    }

    jobLogger.info(`${chartID}: S3 screenshots pending for deletion: ${paths.join(':')}`);

    const deleteCmd = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
            Objects: paths.map(Key => ({ Key }))
        }
    });

    try {
        const deleteResp = await s3Client.send(deleteCmd);
        jobLogger.info(
            `${chartID}: Successfully deleted S3 screenshots: ${deleteResp.Deleted.map(
                d => d.Key
            ).join(':')}`
        );
    } catch (e) {
        jobLogger.error(`${chartID}: Failed to delete S3 screenshots.`);
        throw e;
    }
};

const deleteFileScreenshots = async (id, path, hash) => {
    const combinedPath = join(path, id, hash);
    try {
        await rm(combinedPath, { recursive: true });
        jobLogger.info(`${id}: Successfully deleted file screenshot ${combinedPath}`);
    } catch (e) {
        if (e.code === 'ENOENT') {
            jobLogger.warn(
                `${id}: Failed to delete file screenshot ${combinedPath}, because it doesn't exist.`
            );
        } else {
            jobLogger.error(`${id}: Failed to delete file screenshot ${combinedPath}`);
            throw e;
        }
    }
};

module.exports = async () => {
    const testUserID = await getTestUserID(E2E_MAIL);

    if (!testUserID) {
        jobLogger.info('The test user could not be identified. Nothing has been done.');
        return;
    }

    const APIToken = await getAPIToken(testUserID);

    if (!APIToken) {
        jobLogger.info('Unable to retrieve the API token. Can not use the API like that.');
        return;
    }

    const testChartIDs = await getTestUserCharts(testUserID);
    jobLogger.info(`Found ${testChartIDs.length} charts to remove.`);

    await setChartsDeleted(testChartIDs);

    // we don't want to create a new client for each chart
    const s3Client = s3Params ? new S3Client(s3Params.s3Config) : false;

    for (const testChartID of testChartIDs) {
        const chart = await Chart.findByPk(testChartID);

        if (chart.public_version !== 0) {
            await unPublish(testChartID, APIToken);
        }

        // if the ID is gone now something weird (manual intervention?) happend
        // don't do anything at all
        if (chart === null) {
            jobLogger.info(`${testChartID}: Chart has already been removed during cleanup phase.`);
            continue;
        }

        await deleteAssets(testChartID, APIToken);

        //use hash to make sure we don't accidentally delete other stuff
        const hash = chart.getThumbnailHash();

        if (s3Params) {
            await deleteS3Screenshots(testChartID, s3Client, s3Params.bucket, s3Params.path, hash);
        }

        if (fileParams) {
            await deleteFileScreenshots(testChartID, fileParams.path, hash);
        }

        // now we really delete the chart from the DB
        await chart.destroy();

        await sleep(GRACE_TIME);
    }
};
