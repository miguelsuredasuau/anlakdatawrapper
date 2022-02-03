const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const Api = require('./api');
const config = requireConfig().pixeltracker;

async function start() {
    const api = new Api(config);
    await api.init();
    await api.start();
}

start();
