const { Op } = require('@datawrapper/orm').db;
const { Chart, Stats } = require('@datawrapper/orm/models');

const duration = {
    minutely: 6e4, // analyze last minute
    hourly: 36e5, // analyze last hour
    daily: 864e5, // analyze last day
    weekly: 864e5 * 7, // analyze last week
    monthly: 864e5 * 30 // analyze last week
};

const deleteAfter = {
    monthly: false,
    weekly: false,
    daily: false,
    hourly: 14 * 864e5, // keep 14 days
    minutely: 864e5 // keep 24 hours
};

const recordStats = time => {
    return async () => {
        const stats = [];
        await newlyCreatedCharts(stats, time);
        await newlyVisualizedCharts(stats, time);
        await recentlyEditedCharts(stats, time);
        await newlyPublishedCharts(stats, time);
        await newlyRepublishedCharts(stats, time);

        // store all stats
        await Stats.bulkCreate(stats);

        // clean up stats
        if (deleteAfter[time]) {
            await Stats.destroy({
                where: {
                    metric: { [Op.like]: `charts:${time}:%` },
                    time: { [Op.lt]: new Date(new Date() - deleteAfter[time]) }
                }
            });
        }
    };
};

module.exports = {
    minutely: recordStats('minutely'),
    hourly: recordStats('hourly'),
    daily: recordStats('daily'),
    weekly: recordStats('weekly'),
    monthly: recordStats('monthly')
};

async function newlyCreatedCharts(stats, time) {
    const cnt = await Chart.count({
        where: {
            deleted: 0,
            last_edit_step: { [Op.gt]: 1 },
            created_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `charts:${time}:created`,
        value: cnt
    });
}

async function newlyVisualizedCharts(stats, time) {
    const cnt = await Chart.count({
        where: {
            deleted: 0,
            last_edit_step: { [Op.gt]: 2 },
            created_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `charts:${time}:visualized`,
        value: cnt
    });
}

async function recentlyEditedCharts(stats, time) {
    const cnt = await Chart.count({
        where: {
            deleted: 0,
            last_modified_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `charts:${time}:edited`,
        value: cnt
    });
}

async function newlyPublishedCharts(stats, time) {
    const cnt = await Chart.count({
        where: {
            deleted: 0,
            last_edit_step: { [Op.gt]: 4 },
            created_at: { [Op.gt]: new Date(new Date() - duration[time]) },
            published_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `charts:${time}:published`,
        value: cnt
    });
}

async function newlyRepublishedCharts(stats, time) {
    const cnt = await Chart.count({
        where: {
            deleted: 0,
            last_edit_step: { [Op.gt]: 4 },
            created_at: { [Op.lte]: new Date(new Date() - duration[time]) },
            published_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `charts:${time}:republished`,
        value: cnt
    });
}
