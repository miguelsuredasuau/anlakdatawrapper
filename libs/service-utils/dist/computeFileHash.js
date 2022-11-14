"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const MemoryCache_1 = __importDefault(require("./MemoryCache"));
module.exports = {
    name: 'utils/computeFileHash',
    version: '1.0.0',
    async register(server) {
        const fileHashCache = new MemoryCache_1.default();
        /**
         * computes the hash for one file
         *
         * @param {string} file - file path relative to code root
         */
        async function computeFileHash(file) {
            const cacheKey = path_1.default.relative(path_1.default.join(__dirname, '../..'), file);
            return fileHashCache.withCache(cacheKey, async () => {
                const hash = crypto_1.default.createHash('md5');
                await new Promise((resolve, reject) => {
                    const readStream = fs_1.default.createReadStream(file);
                    readStream.on('readable', () => {
                        const data = readStream.read();
                        if (data) {
                            hash.update(data);
                        }
                        else {
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
            const cacheKey = path_1.default.relative(path_1.default.join(__dirname, '../..'), fileGlob);
            return fileHashCache.withCache(cacheKey, async () => {
                const files = (await (0, fast_glob_1.default)(fileGlob)).sort();
                const hashes = Object.fromEntries(await Promise.all(files.map(async (file) => [file, await computeFileHash(file)])));
                const hashSum = crypto_1.default.createHash('md5');
                hashSum.update(JSON.stringify(hashes));
                return hashSum.digest('hex');
            });
        }
        server.method('computeFileHash', async (file) => (await computeFileHash(file)).substring(0, 8));
        server.method('computeFileGlobHash', async (fileGlob) => (await computeFileGlobHash(fileGlob)).substring(0, 8));
    }
};
