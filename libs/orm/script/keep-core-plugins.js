const { initOrm } = require('../lib/dist');
const config = require('./config');

const { Plugin } = require('../lib/dist/db');

(async () => {
    const { db } = await initOrm(config);
    const rows = await Plugin.findAll();
    const plugins = rows.map(p => p.id);

    await Plugin.register('core', plugins);

    await db.close();
})();
