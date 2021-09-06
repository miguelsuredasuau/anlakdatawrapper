const test = require('ava');
const { setup } = require('../../test/helpers/setup');

test.before(async t => {
    await setup();
    t.context.task = require('./remove-expired-sessions');
});

test('remove expired sessions doesnt throw error', async t => {
    await t.notThrowsAsync(t.context.task);
});
