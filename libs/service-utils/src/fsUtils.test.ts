import fs from 'fs';
import fsPromises from 'fs/promises';
import { fsUtils } from './fsUtils';
import path from 'path';
import test from 'ava';
import tmp from 'tmp';

const prefix = 'dw-service-utils-test-';

test('hasAccess returns true if the user has access to path', async t => {
    let tmpFile;
    try {
        tmpFile = tmp.fileSync({ prefix });
        t.true(await fsUtils.hasAccess(tmpFile.name, fs.constants.W_OK));
    } finally {
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test('hasAccess returns false if the user does not have access to path', async t => {
    let tmpFile;
    try {
        tmpFile = tmp.fileSync({ prefix, mode: 0o400 });
        t.false(await fsUtils.hasAccess(tmpFile.name, fs.constants.W_OK));
    } finally {
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test('hasAccess returns false if the path does not exist', async t => {
    t.false(await fsUtils.hasAccess('spam.txt'));
});

test('isSymbolicLink returns true if the path is a symlink', async t => {
    let tmpDir;
    try {
        tmpDir = tmp.dirSync({ prefix, unsafeCleanup: true });
        const targetPath = path.join(tmpDir.name, 'target.txt');
        await fsPromises.writeFile(targetPath, '');
        const linkPath = path.join(tmpDir.name, 'link.txt');
        await fsPromises.symlink(targetPath, linkPath);
        t.true(await fsUtils.isSymbolicLink(linkPath));
    } finally {
        if (tmpDir) {
            tmpDir.removeCallback();
        }
    }
});

test('isSymbolicLink returns false if the path is not a symlink', async t => {
    let tmpFile;
    try {
        tmpFile = tmp.fileSync({ prefix });
        t.false(await fsUtils.isSymbolicLink(tmpFile.name));
    } finally {
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test('isSymbolicLink returns false if the path does not exist', async t => {
    t.false(await fsUtils.isSymbolicLink('spam.txt'));
});

test('safeUnlink removes the path if it exists', async t => {
    let tmpFile;
    try {
        tmpFile = tmp.fileSync({ prefix });
        t.true(fs.existsSync(tmpFile.name));
        await fsUtils.safeUnlink(tmpFile.name);
        t.false(fs.existsSync(tmpFile.name));
    } finally {
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test('safeUnlink does nothing if the path does not exist', async t => {
    await fsUtils.safeUnlink('spam.txt');
    t.pass();
});
