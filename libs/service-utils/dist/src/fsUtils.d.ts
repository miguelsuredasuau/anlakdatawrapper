/**
 * Returns true if the user has access to `path`.
 */
declare function hasAccess(path: string, mode?: number): Promise<boolean>;
/**
 * Returns true if `path` is a symlink.
 *
 * When the path doesn't exist, then this function returns false.
 */
declare function isSymbolicLink(path: string): Promise<boolean>;
/**
 * Removes `path`.
 *
 * When the path doesn't exist, then this function does nothing.
 */
declare function safeUnlink(path: string): Promise<void>;
declare const _default: {
    hasAccess: typeof hasAccess;
    isSymbolicLink: typeof isSymbolicLink;
    safeUnlink: typeof safeUnlink;
};
export = _default;
