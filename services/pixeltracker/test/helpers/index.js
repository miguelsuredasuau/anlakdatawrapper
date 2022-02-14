const { customAlphabet, nanoid } = require('nanoid');
const { ForeignKeyConstraintError } = require('sequelize');

/* bcrypt hash for string "test-password" */
const PASSWORD_HASH = '$2a$05$6B584QgS5SOXi1m.jM/H9eV.2tCaqNc5atHnWfYlFe5riXVW9z7ja';

async function getTotalChartViews(db, chartId) {
    const [rows] = await db.query('SELECT views FROM pixeltracker_chart WHERE chart_id = ?', [
        chartId
    ]);
    return rows.length ? rows[0].views : 0;
}

async function getChartViewsPerUser(db, userId) {
    const [perDay] = await db.query('SELECT views FROM pixeltracker_user_day WHERE user_id = ?', [
        userId
    ]);
    const [perMonth] = await db.query(
        'SELECT views FROM pixeltracker_user_month WHERE user_id = ?',
        [userId]
    );
    const [perWeek] = await db.query('SELECT views FROM pixeltracker_user_week WHERE user_id = ?', [
        userId
    ]);
    return {
        perDay: perDay.length ? perDay[0].views : 0,
        perMonth: perMonth.length ? perMonth[0].views : 0,
        perWeek: perWeek.length ? perWeek[0].views : 0
    };
}

async function getChartViewsPerTeam(db, teamId) {
    const [perDay] = await db.query(
        'SELECT views FROM pixeltracker_organization_day WHERE organization_id = ?',
        [teamId]
    );
    const [perMonth] = await db.query(
        'SELECT views FROM pixeltracker_organization_month WHERE organization_id = ?',
        [teamId]
    );
    const [perWeek] = await db.query(
        'SELECT views FROM pixeltracker_organization_week WHERE organization_id = ?',
        [teamId]
    );
    return {
        perDay: perDay.length ? perDay[0].views : 0,
        perMonth: perMonth.length ? perMonth[0].views : 0,
        perWeek: perWeek.length ? perWeek[0].views : 0
    };
}

async function getChartViewsPerDomain(db, domain) {
    const [perMonth] = await db.query(
        'SELECT views FROM pixeltracker_domain_month WHERE domain = ?',
        [domain]
    );
    return {
        perMonth: perMonth.length ? perMonth[0].views : 0
    };
}

async function getChartViewsPerEmbedUrl(db, chartId, embedUrl) {
    const [perEmbedUrl] = await db.query(
        'SELECT views FROM pixeltracker_chart_embedurl WHERE chart_id = ? AND url = ?',
        [chartId, embedUrl]
    );
    return perEmbedUrl.length ? perEmbedUrl[0].views : 0;
}

async function getChartViewStatistics(dbPool, chart, user, team, domain, embedUrl) {
    const connection = await dbPool.getConnection();
    try {
        return {
            total: await getTotalChartViews(connection, chart.id),
            perEmbedUrl: await getChartViewsPerEmbedUrl(connection, chart.id, embedUrl),
            perDomain: await getChartViewsPerDomain(connection, domain),
            perTeam: await getChartViewsPerTeam(connection, team.id),
            perUser: await getChartViewsPerUser(connection, user.id)
        };
    } finally {
        await connection.release();
    }
}

async function resetChartViewStatistics(dbPool, charts, users, teams, domains) {
    const connection = await dbPool.getConnection();
    try {
        for (const chart of charts) {
            await connection.query('DELETE FROM pixeltracker_chart WHERE chart_id = ?', [chart.id]);
            await connection.query('DELETE FROM pixeltracker_chart_embedurl WHERE chart_id = ?', [
                chart.id
            ]);
        }

        for (const user of users) {
            await connection.query('DELETE FROM pixeltracker_user_day WHERE user_id = ?', [
                user.id
            ]);
            await connection.query('DELETE FROM pixeltracker_user_month WHERE user_id = ?', [
                user.id
            ]);
            await connection.query('DELETE FROM pixeltracker_user_week WHERE user_id = ?', [
                user.id
            ]);
        }

        for (const team of teams) {
            await connection.query(
                'DELETE FROM pixeltracker_organization_day WHERE organization_id = ?',
                [team.id]
            );
            await connection.query(
                'DELETE FROM pixeltracker_organization_month WHERE organization_id = ?',
                [team.id]
            );
            await connection.query(
                'DELETE FROM pixeltracker_organization_week WHERE organization_id = ?',
                [team.id]
            );
        }

        for (const domain of domains) {
            await connection.query('DELETE FROM pixeltracker_domain_month WHERE domain = ?', [
                domain
            ]);
        }
    } finally {
        await connection.release();
    }
}

const genRandomChartId = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    5
);

function createChart(props = {}) {
    const { Chart } = require('@datawrapper/orm/models');
    return Chart.create({
        metadata: {
            axes: [],
            describe: {},
            visualize: {},
            annotate: {}
        },
        language: 'en-US',
        title: 'Default',
        theme: 'default',
        type: 'd3-bars',
        ...props,
        id: props.id || genRandomChartId()
    });
}

function createCharts(propsArray) {
    return Promise.all(propsArray.map(createChart));
}

async function createUser() {
    const { User } = require('@datawrapper/orm/models');
    const email = `test-${nanoid(5)}@pixeltracker.de`;
    const pwd = PASSWORD_HASH;
    const role = 'editor';
    return await User.create({
        name: `name-${email.split('@').shift()}`,
        email: `test-${nanoid(5)}@pixeltracker.de`,
        pwd,
        role
    });
}

async function createTeam(props = {}) {
    const { Team } = require('@datawrapper/orm/models');

    return await Team.create({
        id: `test-${nanoid(5)}`,
        name: 'Test Team',
        settings: {
            default: {
                locale: 'en-US'
            },
            flags: {
                embed: true,
                byline: true,
                pdf: false
            },
            css: 'body {background:red;}',
            embed: {
                custom_embed: {
                    text: '',
                    title: 'Chart ID',
                    template: '%chart_id%'
                },
                preferred_embed: 'responsive'
            }
        },
        ...props
    });
}

async function destroyChart(chart) {
    const { Chart, ChartPublic } = require('@datawrapper/orm/models');
    await ChartPublic.destroy({ where: { id: chart.id }, force: true });
    await Chart.destroy({ where: { forked_from: chart.id }, force: true });
    await chart.destroy({ force: true });
}

async function destroyTeam(team) {
    const { Chart, TeamProduct, UserTeam, Folder } = require('@datawrapper/orm/models');
    const charts = await Chart.findAll({ where: { organization_id: team.id } });
    for (const chart of charts) {
        await destroyChart(chart);
    }
    await Folder.destroy({ where: { org_id: team.id } });
    await TeamProduct.destroy({ where: { organization_id: team.id }, force: true });
    await UserTeam.destroy({ where: { organization_id: team.id }, force: true });
    await team.destroy({ force: true });
}

async function destroyUser(user) {
    const {
        AccessToken,
        Action,
        Chart,
        Folder,
        Session,
        UserData,
        UserPluginCache,
        UserProduct,
        UserTeam
    } = require('@datawrapper/orm/models');
    await AccessToken.destroy({ where: { user_id: user.id }, force: true });
    await Action.destroy({ where: { user_id: user.id }, force: true });
    await Session.destroy({ where: { user_id: user.id }, force: true });
    const charts = await Chart.findAll({ where: { author_id: user.id } });
    for (const chart of charts) {
        await destroyChart(chart);
    }
    await Folder.destroy({ where: { user_id: user.id } });
    await UserData.destroy({ where: { user_id: user.id }, force: true });
    await UserPluginCache.destroy({ where: { user_id: user.id }, force: true });
    await UserProduct.destroy({ where: { user_id: user.id }, force: true });
    await UserTeam.destroy({ where: { user_id: user.id }, force: true });
    try {
        await user.destroy({ force: true });
    } catch (e) {
        if (e instanceof ForeignKeyConstraintError) {
            // TODO Don't just log and ignore this error, but rather figure out how to delete the
            // associated model instances correctly.
            console.error(e);
        }
    }
}

async function destroyTheme(theme) {
    const { TeamTheme } = require('@datawrapper/orm/models');
    await TeamTheme.destroy({ where: { theme_id: theme.id } });
    await theme.destroy({ force: true });
}

async function destroy(...instances) {
    const { Chart, Team, User, Theme, ChartPublic } = require('@datawrapper/orm/models');
    for (const instance of instances) {
        if (!instance) {
            continue;
        }
        if (Array.isArray(instance)) {
            await destroy(...instance);
        } else if (instance instanceof ChartPublic) {
            await destroyChart(instance);
        } else if (instance instanceof Chart) {
            await destroyChart(instance);
        } else if (instance instanceof Team) {
            await destroyTeam(instance);
        } else if (instance instanceof User) {
            await destroyUser(instance);
        } else if (instance instanceof Theme) {
            await destroyTheme(instance);
        } else if (instance.destroy) {
            await instance.destroy({ force: true });
        }
    }
}

module.exports = {
    getChartViewStatistics,
    resetChartViewStatistics,
    createChart,
    createCharts,
    createUser,
    createTeam,
    destroy
};
