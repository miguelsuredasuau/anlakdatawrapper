'use strict';

const fsUtils = require('@datawrapper/service-utils/fsUtils');
const path = require('path');
const { existsSync } = require('fs');
const { mkdir, readFile, rm, writeFile } = require('fs/promises');

const CACHE_DIR = path.join(__dirname, '../../../.viewcache');

const cache = new Map();

function setCache(key, value) {
    cache.set(key, value);
}

async function withMemoryCache(key, func) {
    if (!cache.has(key)) {
        const value = await func(key);
        setCache(key, value);
        return value;
    }
    return cache.get(key);
}

async function withFileCache(key, func, writeFileCache = false) {
    const filePath = path.join(CACHE_DIR, `${key.replace(/\//g, '_').toLowerCase()}.json`);
    if (existsSync(filePath)) {
        try {
            return JSON.parse(await readFile(filePath, 'utf-8'));
        } catch (e) {
            console.error('Error: deleting corrupt cache file ' + filePath);
            await fsUtils.safeUnlink(filePath);
        }
    }
    const value = await func(key);
    if (writeFileCache) {
        try {
            await mkdir(CACHE_DIR, { recursive: true });
            await writeFile(filePath, JSON.stringify(value));
        } catch (e) {
            console.error('Error: failed to write cache file ' + filePath);
        }
    }
    return value;
}

function withCache(key, func, writeFileCache = false) {
    return withMemoryCache(key, () => withFileCache(key, func, writeFileCache));
}

async function clearFileCache() {
    try {
        process.stdout.write(`Clearing all cache files in ${CACHE_DIR}\n`);
        await rm(CACHE_DIR, { recursive: true });
    } catch (e) {
        // do nothing
    }
}

module.exports = {
    clearFileCache,
    setCache,
    withCache,
    withFileCache
};
