import fs from 'fs/promises';

/**
 * Returns true if the user has access to `path`.
 */
async function hasAccess(path: string, mode?: number): Promise<boolean> {
    try {
        await fs.access(path, mode);
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
async function isSymbolicLink(path: string): Promise<boolean> {
    try {
        const stats = await fs.lstat(path);
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
async function safeUnlink(path: string): Promise<void> {
    try {
        await fs.unlink(path);
    } catch (e) {
        console.error(
            `Failed to unlink ${path}. The path doesn't exist or the user has insufficient permissions.`
        );
    }
}

export const fsUtils = {
    hasAccess,
    isSymbolicLink,
    safeUnlink
};
