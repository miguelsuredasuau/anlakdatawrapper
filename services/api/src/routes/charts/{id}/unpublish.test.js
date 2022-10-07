const test = require('ava');
const sinon = require('sinon');
const { withChart, createUser, destroy, setup } = require('../../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server, { role: 'admin' });
    t.context.auth = {
        strategy: 'session',
        credentials: t.context.userObj.session,
        artifacts: t.context.userObj.user
    };
    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };

    const { events, event } = t.context.server.app;
    t.context.unpublishChartFake = sinon.fake();
    events.on(event.UNPUBLISH_CHART, t.context.unpublishChartFake);
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.userObj));
});

test('POST /charts/{id}/unpublish emits UNPUBLISH_CHART for not deleted chart', async t => {
    await withChart({}, async chart => {
        const resPublish = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(resPublish.statusCode, 200);

        const resUnpublish = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/unpublish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(resUnpublish.statusCode, 204);

        t.true(
            t.context.unpublishChartFake.calledWith(
                sinon.match(arg => arg.chart?.id === chart.id && arg.publicVersion === 1)
            )
        );
    });
});

test('POST /charts/{id}/unpublish emits UNPUBLISH_CHART for deleted chart', async t => {
    await withChart({}, async chart => {
        const resPublish = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(resPublish.statusCode, 200);

        await chart.update({ deleted: true });

        const resUnpublish = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/unpublish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(resUnpublish.statusCode, 204);

        t.true(
            t.context.unpublishChartFake.calledWith(
                sinon.match(arg => arg.chart?.id === chart.id && arg.publicVersion === 1)
            )
        );
    });
});

test('POST /charts/{id}/unpublish resets chart properties', async t => {
    await withChart({}, async chart => {
        let res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 200);

        res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 200);
        t.is(res.result.publicVersion, 1);
        t.is(res.result.lastEditStep, 5);
        t.truthy(res.result.publishedAt);

        res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/unpublish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 204);

        res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 200);
        t.is(res.result.publicVersion, 0);
        t.is(res.result.lastEditStep, 4);
        t.is(res.result.publishedAt, null);
    });
});
