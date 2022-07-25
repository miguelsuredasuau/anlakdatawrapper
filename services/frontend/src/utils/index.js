const isPlainObject = require('lodash/isPlainObject');

function byOrder(a, b) {
    return a.order !== undefined && b.order !== undefined ? a.order - b.order : 0;
}

/**
 * returns list of keys defined in an object
 *
 * @param {object} object
 * @returns {string[]} list of keys
 */
function getNestedObjectKeys(object) {
    const candidates = Object.keys(object);
    const keys = [];
    candidates.forEach(key => {
        if (!isPlainObject(object[key])) keys.push(key);
        else {
            getNestedObjectKeys(object[key]).forEach(subkey => {
                keys.push(`${key}.${subkey}`);
            });
        }
    });
    return keys;
}

function filterNestedObjectKeys(object, removeKeys) {
    if (typeof removeKeys[0] === 'string') {
        // user provided a list of string keys, so split them
        removeKeys = removeKeys.map(keys => keys.split('.'));
    }
    return Object.fromEntries(
        Object.entries(object)
            .map(([key, value]) => {
                // key is the current level, e.g. "metadata"
                // matchingRemoveKeys are all key-lists that start with key
                // e.g. ["metadata"], ["metadata.describe.intro"]
                const matchingRemoveKeys = removeKeys.filter(removeKey => removeKey[0] === key);
                if (!matchingRemoveKeys.length) {
                    // key is not in removeKeys, so we keep it
                    return [key, value, true];
                }
                for (const removeKey of matchingRemoveKeys) {
                    if (removeKey.length === 1) {
                        // key is the first and only removeKey, sofilter immediately
                        return [key, value, false];
                    }
                }
                // key is at the beginning of a removeKey, so we
                // need to filter the child object
                return [
                    key,
                    filterNestedObjectKeys(
                        value,
                        matchingRemoveKeys.map(keys => keys.slice(1))
                    ),
                    true
                ];
            })
            // eslint-disable-next-line no-unused-vars
            .filter(([key, value, keep]) => {
                return keep && (!isPlainObject(value) || Object.keys(value).length > 0);
            })
    );
}

/**
 * wait for test() to return true
 *
 * @param {function} test - test method
 * @param {number} options.interval - number of ms to wait between tests, default 100
 * @param {number} options.timeout - throw exception after [timeout] ms, default 5000
 */
async function waitFor(test, { interval, timeout } = {}) {
    interval = interval || 100;
    timeout = timeout || 15000;
    let result;
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
    }, timeout);
    while (!(result = test())) {
        if (timedOut) throw new Error('waitFor timeout exceeded');
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    clearTimeout(timer);
    return result;
}

/**
 * logs an error to the console and sends it to Sentry
 * via captureException
 *
 * @param {string|Error} error
 */
function logError(error) {
    if (typeof error === 'string') {
        error = new Error(error);
    }
    console.error(error);
    if (typeof window !== 'undefined' && typeof window.Sentry !== 'undefined') {
        window.Sentry.captureException(error);
    }
}

module.exports = {
    byOrder,
    getNestedObjectKeys,
    filterNestedObjectKeys,
    waitFor,
    logError
};
