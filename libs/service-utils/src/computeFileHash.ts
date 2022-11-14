import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import fg from 'fast-glob';
import MemoryCache from './MemoryCache';
import type { Plugin } from 'hapi';

export = {
    name: 'utils/computeFileHash',
    version: '1.0.0',
    async register(server) {
        const fileHashCache = new MemoryCache<string>();

        /**
         * computes the hash for one file
         *
         * @param {string} file - file path relative to code root
         */
        async function computeFileHash(file: string): Promise<string> {
            const cacheKey = path.relative(path.join(__dirname, '../..'), file);

            return fileHashCache.withCache(cacheKey, async () => {
                const hash = crypto.createHash('md5');
                await new Promise<void>((resolve, reject) => {
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
        async function computeFileGlobHash(fileGlob: string): Promise<string> {
            const cacheKey = path.relative(path.join(__dirname, '../..'), fileGlob);
            return fileHashCache.withCache(cacheKey, async () => {
                const files = (await fg(fileGlob)).sort();
                const hashes = Object.fromEntries(
                    await Promise.all(
                        files.map(async (file: string) => [file, await computeFileHash(file)])
                    )
                );
                const hashSum = crypto.createHash('md5');
                hashSum.update(JSON.stringify(hashes));
                return hashSum.digest('hex');
            });
        }

        server.method('computeFileHash', async (file: string) =>
            (await computeFileHash(file)).substring(0, 8)
        );
        server.method('computeFileGlobHash', async (fileGlob: string) =>
            (await computeFileGlobHash(fileGlob)).substring(0, 8)
        );
    }
} as Plugin<undefined>;
