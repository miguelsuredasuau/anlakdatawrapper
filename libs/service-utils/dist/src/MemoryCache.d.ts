/**
 * Simple in-memory cache interface using a Map as storage.
 */
declare const _default: {
    new <T>(): {
        cache: Map<string, T>;
        /**
         * drop a single item from the cache
         * @param {string} key
         */
        drop(key: string): void;
        /**
         * drop all items from the cache
         */
        dropAll(): void;
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
        withCache(key: string, func: (key: string) => Promise<T>, { useCache }?: {
            useCache?: boolean | undefined;
        }): Promise<T>;
    };
};
export = _default;
