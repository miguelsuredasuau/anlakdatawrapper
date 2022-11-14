import { join } from 'path';

export = function joinSafe(rootDir: string, ...args: string[]): string {
    const file = join(rootDir, ...args);
    if (!file.startsWith(rootDir)) throw new Error('invalid path');
    return file;
};
