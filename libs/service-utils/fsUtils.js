const fsPromises = require('fs/promises');

/**
 * Returns true if the user has access to `path`.
 */
async function hasAccess(path, mode) {
    try {
        await fsPromises.access(path, mode);
        return true;
    } catch (e) {
        // ENOENT goes here
        return false;
    }
}

/**
 * Returns true if `path` is a symlink.
 *
 * When the path doesn't exist, then this function returns false.
 */
async function isSymbolicLink(path) {
    try {
        const stats = await fsPromises.lstat(path);
        return stats.isSymbolicLink();
    } catch (e) {
        // ENOENT goes here
        return false;
    }
}

/**
 * Removes `path`.
 *
 * When the path doesn't exist, then this function does nothing.
 */
async function safeUnlink(path) {
    try {
        await fsPromises.unlink(path);
    } catch (e) {
        console.error(
            `Failed to unlink ${path}. The path doesn't exist or the user has insufficient permissions.`
        );
    }
}

module.exports = {
    hasAccess,
    isSymbolicLink,
    safeUnlink
};
