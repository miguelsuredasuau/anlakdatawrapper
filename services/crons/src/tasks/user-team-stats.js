const { Op } = require('@datawrapper/orm').db;
const { User, Team, UserTeam, Stats } = require('@datawrapper/orm/models');

const duration = {
    daily: 864e5, // analyze last day
    weekly: 864e5 * 7, // analyze last week
    monthly: 864e5 * 30 // analyze last week
};

const recordStats = time => {
    return async () => {
        const stats = [];

        await totalUsers(stats, time);
        await totalActivatedUsers(stats, time);
        await newlyCreatedUsers(stats, time);
        await newlyActivatedUsers(stats, time);
        await teamCount(stats, time);
        await newlyCreatedTeams(stats, time);
        await totalTeamMembers(stats, time);
        await totalPendingTeamMembers(stats, time);

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

async function totalUsers(stats, time) {
    const cnt = await User.count({
        where: {
            deleted: 0,
            role: { [Op.not]: 3 }
        }
    });
    stats.push({
        metric: `users:${time}:total`,
        value: cnt
    });
}
async function totalActivatedUsers(stats, time) {
    const cnt = await User.count({
        where: {
            deleted: 0,
            role: { [Op.or]: [0, 1] }
        }
    });
    stats.push({
        metric: `users:${time}:activated-total`,
        value: cnt
    });
}

async function newlyCreatedUsers(stats, time) {
    const cnt = await User.count({
        where: {
            deleted: 0,
            role: { [Op.not]: 3 },
            created_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `users:${time}:created`,
        value: cnt
    });
}

async function newlyActivatedUsers(stats, time) {
    const cnt = await User.count({
        where: {
            role: 1,
            deleted: 0,
            created_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `users:${time}:activated`,
        value: cnt
    });
}

async function teamCount(stats, time) {
    const cnt = await Team.count({
        where: {
            deleted: 0
        }
    });
    stats.push({
        metric: `teams:${time}:total`,
        value: cnt
    });
}

async function newlyCreatedTeams(stats, time) {
    const cnt = await Team.count({
        where: {
            deleted: 0,
            created_at: { [Op.gt]: new Date(new Date() - duration[time]) }
        }
    });
    stats.push({
        metric: `teams:${time}:created`,
        value: cnt
    });
}

async function totalTeamMembers(stats, time) {
    const cnt = await UserTeam.count({
        where: {
            invite_token: ''
        }
    });

    stats.push({
        metric: `team-members:${time}:total`,
        value: cnt
    });
}

async function totalPendingTeamMembers(stats, time) {
    const cnt = await UserTeam.count({
        where: {
            invite_token: { [Op.not]: '' }
        }
    });

    stats.push({
        metric: `team-members:${time}:pending`,
        value: cnt
    });
}
