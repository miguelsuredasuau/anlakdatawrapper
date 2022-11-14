"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const fsUtils_1 = __importDefault(require("./fsUtils"));
const path_1 = __importDefault(require("path"));
const ava_1 = __importDefault(require("ava"));
const tmp_1 = __importDefault(require("tmp"));
const prefix = 'dw-service-utils-test-';
(0, ava_1.default)('hasAccess returns true if the user has access to path', async (t) => {
    let tmpFile;
    try {
        tmpFile = tmp_1.default.fileSync({ prefix });
        t.true(await fsUtils_1.default.hasAccess(tmpFile.name, fs_1.default.constants.W_OK));
    }
    finally {
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});
(0, ava_1.default)('hasAccess returns false if the user does not have access to path', async (t) => {
    let tmpFile;
    try {
        tmpFile = tmp_1.default.fileSync({ prefix, mode: 0o400 });
        t.false(await fsUtils_1.default.hasAccess(tmpFile.name, fs_1.default.constants.W_OK));
    }
    finally {
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});
(0, ava_1.default)('hasAccess returns false if the path does not exist', async (t) => {
    t.false(await fsUtils_1.default.hasAccess('spam.txt'));
});
(0, ava_1.default)('isSymbolicLink returns true if the path is a symlink', async (t) => {
    let tmpDir;
    try {
        tmpDir = tmp_1.default.dirSync({ prefix, unsafeCleanup: true });
        const targetPath = path_1.default.join(tmpDir.name, 'target.txt');
        await promises_1.default.writeFile(targetPath, '');
        const linkPath = path_1.default.join(tmpDir.name, 'link.txt');
        await promises_1.default.symlink(targetPath, linkPath);
        t.true(await fsUtils_1.default.isSymbolicLink(linkPath));
    }
    finally {
        if (tmpDir) {
            tmpDir.removeCallback();
        }
    }
});
(0, ava_1.default)('isSymbolicLink returns false if the path is not a symlink', async (t) => {
    let tmpFile;
    try {
        tmpFile = tmp_1.default.fileSync({ prefix });
        t.false(await fsUtils_1.default.isSymbolicLink(tmpFile.name));
    }
    finally {
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});
(0, ava_1.default)('isSymbolicLink returns false if the path does not exist', async (t) => {
    t.false(await fsUtils_1.default.isSymbolicLink('spam.txt'));
});
(0, ava_1.default)('safeUnlink removes the path if it exists', async (t) => {
    let tmpFile;
    try {
        tmpFile = tmp_1.default.fileSync({ prefix });
        t.true(fs_1.default.existsSync(tmpFile.name));
        await fsUtils_1.default.safeUnlink(tmpFile.name);
        t.false(fs_1.default.existsSync(tmpFile.name));
    }
    finally {
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});
(0, ava_1.default)('safeUnlink does nothing if the path does not exist', async (t) => {
    await fsUtils_1.default.safeUnlink('spam.txt');
    t.pass();
});
