"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCache = void 0;
/**
 * Simple in-memory cache interface using a Map as storage.
 */
class MemoryCache {
    cache;
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
     * Returns cached value for `key`. If the key doesn't exist in the cache, it computes the value
     * using `func` and stores it in the cache.
     *
     * Notice that withCache can call `func` several times for the same key, because while we wait
     * for `func` to resolve, withCache can been called with the same key again.
     *
     * @param {string} key - the key to cache the results under
     * @param {function} func - the method to compute the result
     * @param {object} options - options
     * @param {boolean} [options.useCache=false] - set to true to - set to false to skip cache and always use `func`
     * @returns {Promise<*>} - cached value or result of `func`
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
exports.MemoryCache = MemoryCache;
