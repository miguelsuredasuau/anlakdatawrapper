const Action = require('../models/Action');

/**
 * helper for logging a user action to the `action` table
 *
 * @param {integer} userId - user id
 * @param {string} key - the action key
 * @param {*} details - action details
 */
module.exports.logAction = (...args) => Action.logAction(...args);
