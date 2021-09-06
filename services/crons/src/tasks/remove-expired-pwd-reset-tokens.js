const { db } = require('@datawrapper/orm');
const { QueryTypes } = db;
const logger = require('../logger');

const REMOVE_AFTER_DAYS = 7;

module.exports = async () => {
    const users = await db.query(
        `SELECT u.id FROM \`user\` AS u
        LEFT JOIN \`action\` ON u.id = action.user_id
        WHERE reset_password_token != ''
        AND reset_password_token IS NOT NULL
        AND action.details = reset_password_token
        AND action.\`key\` = 'reset-password'
        AND action_time < DATE_ADD(NOW(), INTERVAL -${REMOVE_AFTER_DAYS} DAY)`,
        { type: QueryTypes.SELECT }
    );

    if (users.length) {
        const res = await db.query(
            `UPDATE \`user\` SET \`user\`.reset_password_token = '' WHERE id IN (${users
                .map(u => u.id)
                .join(',')})`,
            { type: QueryTypes.UPDATE }
        );

        if (res[1] > 0) {
            logger.info(`removed ${res[1]} password reset token(s) because they expired`);
        }
    }
};
