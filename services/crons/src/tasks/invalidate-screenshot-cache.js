const { db } = require('@datawrapper/orm');
const { Op } = db;
const { ExportJob } = require('@datawrapper/orm/models');
const config = require('../config');
const { createJobsHelper } = require('../jobs');
const logger = require('../logger');

module.exports = async () => {
    const cfg = config.crons.screenshots || {};
    if (!cfg.cloudflare) return;

    const jobsHelper = createJobsHelper();

    // prepare statement to compute seconds since job completion
    const nowMinus70Seconds = db.fn('DATE_ADD', db.fn('NOW'), db.literal('INTERVAL -70 SECOND'));

    const jobs = await ExportJob.findAll({
        where: {
            [Op.and]: [
                // job was edit-screenshot
                { key: 'edit-screenshot' },
                // job was successful
                { status: 'done' },
                // job has been completed within last 70 seconds
                db.where(db.col('done_at'), Op.gt, nowMinus70Seconds)
            ]
        }
    });

    const urls = jobs.flatMap(job =>
        job.tasks
            .filter(task => task.action === 's3')
            .map(task => `https://${cfg.cloudflare.url_prefix}/${task.params.path}`)
    );

    logger.info(`found ${urls.length} screenshot urls to invalidate on cloudflare`);

    // cloudflare only allows to invalidate 30 urls at a time, so
    // we want to split them up into batches
    const batches = [];
    while (urls.length) {
        batches.push(urls.splice(0, 30));
    }

    if (batches.length) {
        await jobsHelper.scheduleInvalidateCloudflareJobs(
            batches.map(urls => ({ urls })),
            {
                key: 'invalidate-screenshot-cache',
                priority: 0
            }
        );
    }
};
