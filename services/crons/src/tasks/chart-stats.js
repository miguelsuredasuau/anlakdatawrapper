const { Op } = require('@datawrapper/orm').db;
const { Chart, Stats } = require('@datawrapper/orm/models');

const duration = {
    daily: 864e5, // analyze last day
    weekly: 864e5 * 7, // analyze last week
    monthly: 864e5 * 30 // analyze last week
};

const recordStats = time => {
    return async () => {
        const stats = [];

        await totalCharts(stats, time);
        await totalVisualizedCharts(stats, time);
        await totalPublishedCharts(stats, time);
        await newlyCreatedCharts(stats, time);
        await newlyVisualizedCharts(stats, time);
        await newlyPublishedCharts(stats, time);
        await newlyRepublishedCharts(stats, time);

        // store all stats
        await Stats.bulkCreate(stats);
        // stats.forEach(r => console.log(r));
    };
};

module.exports = {
    daily: recordStats('daily'),
    weekly: recordStats('weekly'),
    monthly: recordStats('monthly')
};

async function totalCharts (stats, time) {
    const cnt = await Chart.count({
        where: {
            deleted: 0,
            last_edit_step: { [Op.gt]: 1 }
        }
    });
    stats.push({
        metric: `charts:${time}:total`,
        value: cnt
    });
}

async function totalVisualizedCharts (stats, time) {
    const cnt = await Chart.count({
        where: {
            deleted: 0,
            last_edit_step: { [Op.gt]: 2 }
        }
    });
    stats.push({
        metric: `charts:${time}:visualized-total`,
        value: cnt
    });
}

async function totalPublishedCharts (stats, time) {
    const cnt = await Chart.count({
        where: {
            deleted: 0,
            last_edit_step: { [Op.gt]: 4 },
            published_at: { [Op.not]: null }
        }
    });
    stats.push({
        metric: `charts:${time}:published-total`,
        value: cnt
    });
}

async function newlyCreatedCharts (stats, time) {
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

async function newlyVisualizedCharts (stats, time) {
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

async function newlyPublishedCharts (stats, time) {
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

async function newlyRepublishedCharts (stats, time) {
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
