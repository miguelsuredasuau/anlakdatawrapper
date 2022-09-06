const { db } = require('@datawrapper/orm');
const { QueryTypes } = db;
const logger = require('../logger');

module.exports = async () => {
    const status = await db.query('SELECT un_smoke() AS smoke', {
        type: QueryTypes.SELECT,
        plain: true,
        raw: true
    });

    if (status.smoke < 0) {
        logger.info(`The smoke test user could not be identified. Nothing has been done.`);
        return;
    }

    logger.info(`Smoke removal reported ${status.smoke} removed charts.`);
};
