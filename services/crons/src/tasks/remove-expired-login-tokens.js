const { SQ } = require('@datawrapper/orm');
const { Op } = SQ;
const { AccessToken } = require('@datawrapper/orm/db');
const logger = require('../logger');

module.exports = async () => {
    const minus1Hour = SQ.fn('DATE_ADD', SQ.fn('NOW'), SQ.literal('INTERVAL -1 HOUR'));

    const tokenCount = await AccessToken.destroy({
        where: {
            [Op.and]: [{ type: 'login-token' }, SQ.where(SQ.col('created_at'), Op.lt, minus1Hour)]
        }
    });

    if (tokenCount) {
        logger.info(`Cleaned up ${tokenCount} unused login tokens`);
    }
};
