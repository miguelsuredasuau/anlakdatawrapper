const nock = require('nock');
const test = require('ava');
const { createGuestSession, setup } = require('../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    const session = await createGuestSession(t.context.server);
    t.context.headers = {
        cookie: `DW-SESSION=${session}; crumb=abc`,
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };
});

test('geocode proxies a request with duplicate query params', async t => {
    const scope = nock('https://api.opencagedata.com')
        .get('/geocode/v1/json?q=foo%20bar&duplicate=1&duplicate=2&key=fake-opencage-key')
        .reply(200, 'fake-opencage-response', {
            'Content-Type': 'text/plain'
        });
    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/utils/geocode?q=foo%20bar&duplicate=1&duplicate=2',
        headers: t.context.headers
    });
    t.is(res.statusCode, 200);
    t.deepEqual(res.result, 'fake-opencage-response');
    t.is(res.headers['content-type'], 'text/plain; charset=utf-8');
    t.true(scope.isDone());
});
