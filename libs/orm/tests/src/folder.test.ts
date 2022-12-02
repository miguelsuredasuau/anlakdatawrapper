import anyTest, { type TestFn } from 'ava';
import { randomInt } from 'crypto';
import { SQ, type DB } from '@datawrapper/orm-lib';
import { Folder } from '@datawrapper/orm-lib/db';
import { createTeam, createUser, destroy } from './helpers/fixtures';
import { init } from './helpers/orm';

const test = anyTest as TestFn<{
    db: DB;
}>;

test.before(async t => {
    t.context.db = await init();
});

test('Folder validation fails when both team and user are set', async t => {
    let folder;
    try {
        const team = await createTeam();
        const user = await createUser();
        await t.throwsAsync(
            async () => {
                folder = await Folder.create({
                    id: randomInt(2 ** 16),
                    org_id: team.id,
                    user_id: user.id
                });
            },
            { instanceOf: SQ.ValidationError }
        );
    } finally {
        await destroy(folder);
    }
});

test('Folder validation succeeds when neither team nor user are set', async t => {
    let folder;
    try {
        folder = await Folder.create();
        t.pass();
    } finally {
        await destroy(folder);
    }
});
