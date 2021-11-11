const groupBy = require('lodash/groupBy');

function guessUserName(user, __) {
    let n = user.name;
    if (!n) {
        n = user.email;
    }
    if (!n) {
        n = user.oauth_signin;
    }
    if (n && n.includes('::')) {
        n = n.substring(n.indexOf('::') + 2);
    }
    if (!n) {
        n = `${__('User')} ${user.id}`;
    }
    return n;
}

function getChartStatus(lastEditStep) {
    if (lastEditStep > 4) {
        return 'published';
    }
    if (lastEditStep > 3) {
        return 'drafts';
    }
    return 'just data';
}

function normalizeChartType(type) {
    if (type === 'line-chart') {
        return 'd3-lines';
    }
    if (type === 'bar-chart') {
        return 'd3-bars';
    }
    return type;
}

function groupItems({ items, getProperty, translateGroupName = k => k }) {
    const groups = groupBy(items, item => getProperty(item));
    const entries = Object.entries(groups).map(([k, v]) => [translateGroupName(k), v]);
    return Object.fromEntries(entries);
}

function groupChartsByAuthor(charts, __) {
    return groupItems({
        items: charts,
        getProperty: chart => guessUserName(chart.author, __)
    });
}

function groupChartsByStatus(charts, __) {
    return groupItems({
        items: charts,
        getProperty: chart => getChartStatus(chart.lastEditStep),
        translateGroupName: k => __(k)
    });
}

function groupChartsByType(charts, visualizations) {
    return groupItems({
        items: charts,
        getProperty: chart => normalizeChartType(chart.type),
        translateGroupName: type => (visualizations[type] ? visualizations[type].title : type)
    });
}

function groupCharts({ charts, groupBy, __, visualizations }) {
    if (groupBy === 'author') {
        return groupChartsByAuthor(charts, __);
    }
    if (groupBy === 'status') {
        return groupChartsByStatus(charts, __);
    }
    if (groupBy === 'type') {
        return groupChartsByType(charts, visualizations);
    }
    throw new Error('Unknown groupBy value');
}

module.exports = { groupCharts };
