const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const fg = require('fast-glob');
const MemoryCache = require('./MemoryCache');

module.exports = {
    name: 'utils/computeFileHash',
    version: '1.0.0',
    async register(server) {
        const fileHashCache = new MemoryCache();
        /**
         * computes the hash for one file
         *
         * @param {string} path - file path relative to code root
         */
        async function computeFileHash(file) {
            const cacheKey = path.relative(path.join(__dirname, '../..'), file);

            return fileHashCache.withCache(cacheKey, async () => {
                const hash = crypto.createHash('md5');
                await new Promise((resolve, reject) => {
                    const readStream = fs.createReadStream(file);
                    readStream.on('readable', () => {
                        const data = readStream.read();
                        if (data) {
                            hash.update(data);
                        } else {
                            resolve();
                        }
                    });
                    readStream.on('error', reject);
                });
                return hash.digest('hex');
            });
        }

        /**
         * computes the hash for all files that match passed glob pattern
         *
         * @param {string} fileGlob - glob pattern
         */
        async function computeFileGlobHash(fileGlob) {
            const cacheKey = path.relative(path.join(__dirname, '../..'), fileGlob);
            return fileHashCache.withCache(cacheKey, async () => {
                const files = (await fg(fileGlob)).sort();
                const hashes = Object.fromEntries(
                    await Promise.all(files.map(async file => [file, await computeFileHash(file)]))
                );
                const hashSum = crypto.createHash('md5');
                hashSum.update(JSON.stringify(hashes));
                return hashSum.digest('hex');
            });
        }

        server.method('computeFileHash', async file =>
            (await computeFileHash(file)).substring(0, 8)
        );
        server.method('computeFileGlobHash', async fileGlob =>
            (await computeFileGlobHash(fileGlob)).substring(0, 8)
        );
    }
};
