'use strict';

const cache = new Map();

async function withCache(key, func) {
    if (cache.has(key)) {
        return cache.get(key);
    }
    const value = await func(key);
    cache.set(key, value);
    return value;
}

module.exports = {
    withCache,
    clearCache(key) {
        cache.delete(key);
    }
};
