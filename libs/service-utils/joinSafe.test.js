import test from 'ava';
import { join } from 'path';
import joinSafe from './joinSafe';

test('sub-paths work fine', t => {
    const rootDir = __dirname;
    t.is(joinSafe(rootDir, 'package.json'), join(rootDir, 'package.json'));
    t.is(joinSafe(rootDir, '.github', 'workflows'), join(rootDir, '.github', 'workflows'));
});

test('breaking out of root fails', t => {
    const rootDir = __dirname;
    t.throws(() => joinSafe(rootDir, '../schemas/package.json'));
});
