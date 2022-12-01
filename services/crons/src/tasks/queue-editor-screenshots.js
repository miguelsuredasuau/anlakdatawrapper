const { SQ } = require('@datawrapper/orm');
const { Op } = SQ;
const { Chart, ExportJob } = require('@datawrapper/orm/db');
const config = require('../config');
// const logger = require('../logger');

module.exports = async () => {
    // prepare statement to compute seconds since last edit
    const nowMinus70Seconds = SQ.fn('DATE_ADD', SQ.fn('NOW'), SQ.literal('INTERVAL -70 SECOND'));

    // retreive charts
    const editedCharts = await Chart.findAll({
        attributes: [
            'id',
            'author_id',
            'organization_id',
            [
                SQ.fn(
                    'MD5',
                    SQ.fn(
                        'CONCAT',
                        SQ.col('id'),
                        '--',
                        SQ.fn('UNIX_TIMESTAMP', SQ.col('created_at'))
                    )
                ),
                'hash'
            ]
        ],
        limit: 200,
        order: [['last_modified_at', 'DESC']],
        where: {
            [Op.and]: [
                // chart not deleted AND
                { deleted: false },
                // not a guest chart
                { guest_session: null },
                // chart edited within last N seconds
                SQ.where(SQ.col('last_modified_at'), Op.gt, nowMinus70Seconds)
            ]
        }
    });

    // create export jobs for the charts
    const newJobs = editedCharts.map(chart => {
        const imagePath = config.crons.screenshots.path
            ? `${chart.id}/${config.crons.screenshots.path}/`
            : `${chart.id}/${chart.get('hash')}/`;

        const tasks = [];

        tasks.push({
            // first take some screenshots
            action: 'png',
            params: {
                delay: 500,
                sizes: [
                    {
                        zoom: 2,
                        width: 480,
                        height: 360,
                        plain: true,
                        out: 'plain.png'
                    },
                    {
                        zoom: 2,
                        width: 540,
                        height: 'auto',
                        plain: false,
                        out: 'full.png'
                    }
                ]
            }
        });

        tasks.push({
            action: 'compress',
            params: { image: 'plain.png' }
        });

        tasks.push({
            action: 'compress',
            params: { image: 'full.png' }
        });

        // now check for other things we need to do
        const cfg = config.crons.screenshots;
        if (cfg.s3) {
            // upload to S3
            tasks.push(
                {
                    action: 's3',
                    params: {
                        file: 'plain.png',
                        bucket: cfg.s3.bucket,
                        acl: cfg.s3.acl || 'public-read',
                        path: `${cfg.s3.path ? cfg.s3.path + '/' : ''}${imagePath}plain.png`
                    }
                },
                {
                    action: 's3',
                    params: {
                        file: 'full.png',
                        bucket: cfg.s3.bucket,
                        acl: cfg.s3.acl || 'public-read',
                        path: `${cfg.s3.path ? cfg.s3.path + '/' : ''}${imagePath}full.png`
                    }
                }
            );
        }
        if (cfg.file) {
            // just copy the image to some local folder
            tasks.push(
                {
                    action: 'file',
                    params: {
                        file: 'plain.png',
                        out: cfg.file.path + '/' + imagePath + 'plain.png'
                    }
                },
                {
                    action: 'file',
                    params: {
                        file: 'full.png',
                        out: cfg.file.path + '/' + imagePath + 'full.png'
                    }
                }
            );
        }

        return {
            key: 'edit-screenshot',
            chart_id: chart.id,
            user_id: chart.author_id,
            created_at: new Date(),
            status: 'queued',
            priority: 0,
            tasks
        };
    });

    if (newJobs.length) {
        await ExportJob.bulkCreate(newJobs);
        // logger.info(`queued ${newJobs.length} new edit-screenshot jobs`);
    }
};
