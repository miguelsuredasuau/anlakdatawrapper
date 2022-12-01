const { SQ } = require('@datawrapper/orm');
const { Op } = SQ;
const { User, Session } = require('@datawrapper/orm/db');
const logger = require('../logger');

/*
 * this cron removes admin sessions which haven't
 * been used in the last 24 hours.
 */
module.exports = async () => {
    const lastUpdatedAgo = SQ.fn('DATEDIFF', SQ.fn('NOW'), SQ.col('last_updated'));

    const adminIds = (
        await User.findAll({
            where: {
                role: 'admin'
            }
        })
    ).map(el => el.id);

    const deletedAdminSessions = await Session.destroy({
        where: {
            [Op.and]: [
                // last updated 1 day ago, AND...
                SQ.where(lastUpdatedAgo, Op.gt, 1),
                { user_id: adminIds }
            ]
        }
    });

    if (deletedAdminSessions > 0) {
        logger.info(`removed ${deletedAdminSessions} expired admin sessions.`);
    }
};
