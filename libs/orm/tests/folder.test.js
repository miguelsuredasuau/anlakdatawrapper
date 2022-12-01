const test = require('ava');
const { ValidationError } = require('sequelize');
const { Folder } = require('../db');
const { createTeam, createUser, destroy } = require('./helpers/fixtures');
const { init } = require('./helpers/orm');
const { randomInt } = require('crypto');

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
            { instanceOf: ValidationError }
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
