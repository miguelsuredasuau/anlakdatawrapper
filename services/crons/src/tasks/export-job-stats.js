const { db } = require('@datawrapper/orm');
const { Op } = db;
const { ExportJob, Stats } = require('@datawrapper/orm/models');
const { groupBy } = require('lodash');
const { quantile } = require('d3-array');

const deleteAfter = {
    daily: 365 * 864e5, // keep 1 year
    hourly: 14 * 864e5, // keep 14 days
    minutely: 864e5 // keep 24 hours
};

const duration = {
    daily: 864e5, // analyze last day
    hourly: 36e5, // analyze last hour
    minutely: 6e4 // analyze last minute
};

const recordStats = time => {
    return async () => {
        const stats = [];

        // number of total queued export jobs (as of now)
        await queuedJobs(stats, time);

        // number of new jobs created per key in period
        await newlyCreatedJobs(stats, time);

        // number of jobs completed per key in period
        await completedJobs(stats, time);

        // number of jobs failed per key in period
        await failedJobs(stats, time);

        // aggregated processing times for completed tasks in last period
        await completedJobsTime(stats, time);

        // store all stats
        await Stats.bulkCreate(stats);
        // rows.forEach(r => console.log(r.toJSON()));

        // trim daily stats after x days
        Stats.destroy({
            where: {
                metric: { [Op.like]: `job:${time}:%` },
                time: { [Op.lt]: new Date(new Date() - deleteAfter[time]) }
            }
        });
    };
};

module.exports = {
    daily: recordStats('daily'),
    hourly: recordStats('hourly'),
    minutely: recordStats('minutely')
};

async function queuedJobs (stats, time) {
    const res = await ExportJob.findAll({
        attributes: ['key', [db.fn('count', db.literal('*')), 'cnt']],
        group: ['key'],
        where: { status: 'queued' }
    });
    res.forEach(r => {
        stats.push({
            metric: `job:${time}:${r.key}:queue`,
            value: r.get('cnt')
        });
    });
}

async function newlyCreatedJobs (stats, time) {
    const res = await ExportJob.findAll({
        attributes: ['key', [db.fn('count', db.literal('*')), 'cnt']],
        group: ['key'],
        where: {
            created_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    res.forEach(r => {
        stats.push({
            metric: `job:${time}:${r.key}:created`,
            value: r.get('cnt')
        });
    });
}

async function completedJobs (stats, time) {
    const res = await ExportJob.findAll({
        attributes: ['key', [db.fn('count', db.literal('*')), 'cnt']],
        group: ['key'],
        where: {
            status: 'done',
            done_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    res.forEach(r => {
        stats.push({
            metric: `job:${time}:${r.key}:done`,
            value: r.get('cnt')
        });
    });
}

async function failedJobs (stats, time) {
    const res = await ExportJob.findAll({
        attributes: ['key', [db.fn('count', db.literal('*')), 'cnt']],
        group: ['key'],
        where: {
            status: 'failed',
            done_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    res.forEach(r => {
        stats.push({
            metric: `job:${time}:${r.key}:failed`,
            value: r.get('cnt')
        });
    });
}

async function completedJobsTime (stats, time) {
    const completedJobs = await ExportJob.findAll({
        attributes: [
            'key',
            [
                db.fn(
                    'TIMESTAMPDIFF',
                    db.literal('SECOND'),
                    db.col('created_at'),
                    db.col('done_at')
                ),
                'processing_time'
            ]
        ],
        where: {
            status: 'done',
            done_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    const grouped = groupBy(completedJobs.map(d => d.toJSON()), 'key');
    Object.keys(grouped).forEach(key => {
        const times = grouped[key].map(d => d.processing_time).sort((a, b) => a - b);
        [
            ['min', times[0]],
            ['p1', quantile(times, 0.01)],
            ['p5', quantile(times, 0.05)],
            ['p25', quantile(times, 0.25)],
            ['median', quantile(times, 0.5)],
            ['p75', quantile(times, 0.75)],
            ['p95', quantile(times, 0.95)],
            ['p99', quantile(times, 0.99)],
            ['max', times[times.length - 1]]
        ].forEach(([m, val]) => {
            stats.push({
                metric: `job:${time}:${key}:time:${m}`,
                value: val
            });
        });
    });
}
