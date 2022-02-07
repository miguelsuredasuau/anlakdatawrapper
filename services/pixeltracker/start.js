const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const config = requireConfig().pixeltracker;

let app;
if (process.argv[2] === 'api') {
    const Api = require('./src/api');
    app = new Api(config);
} else if (process.argv[2] === 'flusher') {
    const Flusher = require('./src/flusher');
    app = new Flusher(config);
} else {
    process.stderr.write('Usage: start.js api|flusher');
    process.exit();
}

process.on('SIGINT', async () => {
    process.stderr.write('SIGINT signal received.');
    await app.stop();
});
process.on('SIGTERM', async () => {
    process.stderr.write('SIGTERM signal received.');
    await app.stop();
});

app.init().then(() => app.start());
