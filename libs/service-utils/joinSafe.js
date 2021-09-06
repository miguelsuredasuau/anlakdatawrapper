const { join } = require('path');

export default function joinSafe(rootDir, ...args) {
    const file = join(rootDir, ...args);
    if (!file.startsWith(rootDir)) throw new Error('invalid path');
    return file;
}
