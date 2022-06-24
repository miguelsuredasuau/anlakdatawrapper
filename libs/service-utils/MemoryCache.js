/**
 * Simple in-memory cache interface using a Map as storage.
 */
class MemoryCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * drop a single item from the cache
     * @param {string} key
     */
    drop(key) {
        this.cache.delete(key);
    }

    /**
     * drop all items from the cache
     */
    dropAll() {
        this.cache.clear();
    }

    /**
     * `withCache` will either return the cached result or compute
     * it using the provided function if the key does not yet exist
     *
     * @param {string} key - the key to cache the results under
     * @param {function} func - the method to compute the result
     * @param {object} options
     * @returns
     */
    async withCache(key, func, { useCache = true } = {}) {
        if (useCache && this.cache.has(key)) {
            return this.cache.get(key);
        }
        const value = await func(key);
        if (useCache) {
            this.cache.set(key, value);
        }
        return value;
    }
}

module.exports = MemoryCache;
