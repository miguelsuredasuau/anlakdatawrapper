const { db } = require('@datawrapper/orm');
const { Op } = db;
const { User, Session } = require('@datawrapper/orm/models');
const logger = require('../logger');

/*
 * this cron removes admin sessions which haven't
 * been used in the last 24 hours.
 */
module.exports = async () => {
    const lastUpdatedAgo = db.fn('DATEDIFF', db.fn('NOW'), db.col('last_updated'));

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
                db.where(lastUpdatedAgo, Op.gt, 1),
                { user_id: adminIds }
            ]
        }
    });

    if (deletedAdminSessions > 0) {
        logger.info(`removed ${deletedAdminSessions} expired admin sessions.`);
    }
};
