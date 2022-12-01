const { SQ } = require('@datawrapper/orm');
const { Op } = SQ;
const { AuthToken, Stats } = require('@datawrapper/orm/db');

const duration = {
    daily: 864e5, // analyze last day
    weekly: 864e5 * 7, // analyze last week
    monthly: 864e5 * 30 // analyze last week
};

const recordStats = time => {
    return async () => {
        const stats = [];

        await totalTokens(stats, time);
        await totalUsedTokens(stats, time);
        await newlyCreatedTokens(stats, time);
        await recentlyUsedTokens(stats, time);

        // store all stats
        await Stats.bulkCreate(stats);
    };
};

module.exports = {
    daily: recordStats('daily'),
    weekly: recordStats('weekly'),
    monthly: recordStats('monthly')
};

async function totalTokens(stats, time) {
    const cnt = await AuthToken.count();
    stats.push({
        metric: `api-tokens:${time}:total`,
        value: cnt
    });
}

async function totalUsedTokens(stats, time) {
    const cnt = await AuthToken.count({
        where: {
            last_used_at: { [Op.not]: null }
        }
    });
    stats.push({
        metric: `api-tokens:${time}:used-total`,
        value: cnt
    });
}

async function newlyCreatedTokens(stats, time) {
    const cnt = await AuthToken.count({
        where: {
            created_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `api-tokens:${time}:created`,
        value: cnt
    });
}

async function recentlyUsedTokens(stats, time) {
    const cnt = await AuthToken.count({
        where: {
            last_used_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `api-tokens:${time}:used`,
        value: cnt
    });
}
