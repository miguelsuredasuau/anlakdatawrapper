const UserData = require('../models/UserData');

/**
 * a quick way to retreive a user setting stored in user_data
 * @param {number} userId
 * @param {string} key
 * @param {string} _default - fallback value to be used if key not set yet
 * @returns the stored value
 */
module.exports.getUserData = (...args) => UserData.getUserData(...args);

/**
 * a quick way to set or update a user setting in user_data
 * @param {number} userId
 * @param {string} key
 * @param {string} value
 */
module.exports.setUserData = (...args) => UserData.setUserData(...args);

/**
 * a quick way to remove user setting in user_data
 * @param {number} userId
 * @param {string} key
 */
module.exports.unsetUserData = (...args) => UserData.unsetUserData(...args);
