const { Op } = require('@datawrapper/orm').db;
const { UserProduct, TeamProduct } = require('@datawrapper/orm/models');
const logger = require('../logger');

module.exports = async () => {
    const expiredProducts = {
        where: { expires: { [Op.lt]: new Date() } }
    };

    const numUserProducts = await UserProduct.destroy(expiredProducts);
    if (numUserProducts > 0) {
        logger.info(`removed ${numUserProducts} product(s) from users because they expired`);
    }

    const numTeamProducts = await TeamProduct.destroy(expiredProducts);
    if (numTeamProducts > 0) {
        logger.info(`removed ${numTeamProducts} product(s) from teams because they expired`);
    }
};
