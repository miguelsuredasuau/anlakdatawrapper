const { customAlphabet } = require('nanoid');
const { ForeignKeyConstraintError } = require('sequelize');

async function getChartViewStatistics(db, chartId) {
    const [rows] = await db.query(
        'SELECT chart_id, views FROM pixeltracker_chart WHERE chart_id = ?',
        [chartId]
    );
    return rows;
}

async function resetChartViewStatistics(db, chartId) {
    if (!chartId) return;
    return await db.query('DELETE FROM pixeltracker_chart WHERE chart_id = ?', [chartId]);
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
    destroy
};
