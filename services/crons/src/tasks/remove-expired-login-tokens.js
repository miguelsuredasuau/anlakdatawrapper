const { db } = require('@datawrapper/orm');
const { Op } = db;
const { AccessToken } = require('@datawrapper/orm/models');
const logger = require('../logger');

module.exports = async () => {
    const minus1Hour = db.fn('DATE_ADD', db.fn('NOW'), db.literal('INTERVAL -1 HOUR'));

    const tokenCount = await AccessToken.destroy({
        where: {
            [Op.and]: [{ type: 'login-token' }, db.where(db.col('created_at'), Op.lt, minus1Hour)]
        }
    });

    if (tokenCount) {
        logger.info(`Cleaned up ${tokenCount} unused login tokens`);
    }
};
