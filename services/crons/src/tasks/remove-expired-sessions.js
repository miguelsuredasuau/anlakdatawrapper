const { SQ } = require('@datawrapper/orm');
const { Op } = SQ;
const { Session } = require('@datawrapper/orm/db');
const logger = require('../logger');

/*
 * this cron removes non-persistent sessions which haven't
 * been updated in the last 90 days. since sessions get updated
 * on every request, this means we're deleting sessions from
 * users who haven't used Datawrapper in 90 days.
 *
 * this excludes "persistent" sessions, where users left the
 * checkbox "remember login" checked.
 */
module.exports = async () => {
    const lastUpdatedAgo = SQ.fn('DATEDIFF', SQ.fn('NOW'), SQ.col('last_updated'));

    const expiredSessions = {
        where: {
            [Op.and]: [
                // last updated 90 days ago, AND...
                SQ.where(lastUpdatedAgo, Op.gt, 90),
                {
                    [Op.or]: [
                        // either not persistent OR...
                        { persistent: false },
                        // a guest session
                        { user_id: null }
                    ]
                }
            ]
        },
        // adding a limit to make sure this query doesn't
        // run for eternity in case there are *tons* of
        // expired sessions
        limit: 10000
    };

    const numDeleted = await Session.destroy(expiredSessions);
    // we may want to increase the log threshold at some point
    // if we feel the logs are too cluttered.
    if (numDeleted > 0) {
        logger.info(`removed ${numDeleted} expired sessions.`);
        if (numDeleted > 5000) {
            logger.warn(
                'there have been a lot of expired sessions. if this is normal now ' +
                    'we should probably increase the frequency of the remove-expired-sessions cron.'
            );
        }
    }
};
