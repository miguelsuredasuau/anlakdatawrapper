"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsUtils = void 0;
const promises_1 = __importDefault(require("fs/promises"));
/**
 * Returns true if the user has access to `path`.
 */
async function hasAccess(path, mode) {
    try {
        await promises_1.default.access(path, mode);
        return true;
    }
    catch (e) {
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
        const stats = await promises_1.default.lstat(path);
        return stats.isSymbolicLink();
    }
    catch (e) {
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
        await promises_1.default.unlink(path);
    }
    catch (e) {
        console.error(`Failed to unlink ${path}. The path doesn't exist or the user has insufficient permissions.`);
    }
}
exports.fsUtils = {
    hasAccess,
    isSymbolicLink,
    safeUnlink
};
