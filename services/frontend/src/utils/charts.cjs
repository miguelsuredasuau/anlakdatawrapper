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
    switch (lastEditStep) {
        case 5:
            return 'archive / status / published';
        case 4:
        case 3:
            return 'archive / status / draft';
    }
    return 'archive / status / just-data';
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

function groupCharts({ charts, groupBy, __ }) {
    if (groupBy === 'author') {
        return groupChartsByAuthor(charts, __);
    }
    if (groupBy === 'status') {
        return groupChartsByStatus(charts, __);
    }
    throw new Error('Unknown groupBy value');
}

module.exports = { groupCharts };
