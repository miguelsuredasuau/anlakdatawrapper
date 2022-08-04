const CodedError = require('@datawrapper/service-utils/CodedError.js');
const test = require('ava');
const { Readable } = require('stream');
const { createChart, createUser, destroy, setup } = require('../../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server, { role: 'admin' });
    t.context.auth = {
        strategy: 'session',
        credentials: t.context.userObj.session,
        artifacts: t.context.userObj.user
    };
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.userObj));
});

test('Invalid export format returns 400', async t => {
    // create a new chart
    let res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        headers: {
            cookie: `DW-SESSION=${t.context.auth.credentials.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {}
    });
    const chart = res.result;
    t.is(res.statusCode, 201);

    // lets get a geojson of this
    res = await t.context.server.inject({
        method: 'POST',
        url: `/v3/charts/${chart.id}/export/geojson`,
        headers: {
            cookie: `DW-SESSION=${t.context.auth.credentials.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {}
    });

    // this should be a Bad Request
    t.is(res.statusCode, 400);
});

test('Guests not allowed to export PNG', async t => {
    // create guest session
    let res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/session'
    });
    const sessionToken = res.result['DW-SESSION'];

    // create a new guest chart
    const chart = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        headers: {
            cookie: `DW-SESSION=${sessionToken}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {
            metadata: {
                annotate: {
                    notes: 'note-1'
                }
            }
        }
    });
    // export should fail
    res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${chart.result.id}/export/png`,
        headers: {
            cookie: `DW-SESSION=${sessionToken}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {}
    });
    t.is(res.statusCode, 401);
});

test('POST /export/{format}/async/{exportId} streams the result of CHART_EXPORT once it finishes', async t => {
    const CHART_EXPORT_SLEEP_MS = 50;

    const chart = await createChart();

    function mockChartExportPDFListener({ data }) {
        if (data.id === chart.id && data.format === 'pdf') {
            return 'Test PDF data';
        }
        return undefined;
    }

    function mockChartExportPNGListener({ data }) {
        if (data.id === chart.id && data.format === 'png') {
            return new Promise(resolve =>
                setTimeout(
                    () =>
                        resolve({
                            testChartId: chart.id,
                            testData: 'Test PNG data'
                        }),
                    CHART_EXPORT_SLEEP_MS
                )
            );
        }
        return undefined;
    }

    function mockChartExportStreamListener({ testChartId, testData }) {
        if (testChartId === chart.id) {
            const stream = new Readable();
            stream.push(testData);
            stream.push(null); // Indicate the end of the stream.
            return {
                stream,
                type: 'application/x.test-chart-export-mime'
            };
        }
        return undefined;
    }

    const { events, event } = t.context.server.app;

    // Add two listener that each handles different export format to test that the API chooses the
    // result that matches the passed format.
    events.on(event.CHART_EXPORT, mockChartExportPDFListener);
    events.on(event.CHART_EXPORT, mockChartExportPNGListener);

    events.on(event.CHART_EXPORT_STREAM, mockChartExportStreamListener);

    try {
        // Start an asynchronous export.
        const resAsync = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/export/png/async`,
            headers: {
                cookie: `DW-SESSION=${t.context.auth.credentials.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {}
        });
        t.is(resAsync.statusCode, 200);
        const checkUrl = resAsync.result.url;

        // The first check if the export has finished should be unsuccessful.
        const resCheck1 = await t.context.server.inject({
            method: 'GET',
            url: checkUrl,
            headers: {
                cookie: `DW-SESSION=${t.context.auth.credentials.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });
        t.is(resCheck1.statusCode, 425);

        // Wait until our mock CHART_EXPORT listener finishes.
        let resCheck2;
        for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, CHART_EXPORT_SLEEP_MS));

            // The second check if the export has finished should be successful.
            resCheck2 = await t.context.server.inject({
                method: 'GET',
                url: checkUrl,
                headers: {
                    cookie: `DW-SESSION=${t.context.auth.credentials.id}; crumb=abc`,
                    'X-CSRF-Token': 'abc',
                    referer: 'http://localhost'
                }
            });
            if (resCheck2.statusCode === 200) {
                break;
            }
        }
        t.is(resCheck2.statusCode, 200);
        t.is(resCheck2.result, 'Test PNG data');
        t.is(resCheck2.headers['content-type'], 'application/x.test-chart-export-mime');
    } finally {
        events.off(event.CHART_EXPORT, mockChartExportPDFListener);
        events.off(event.CHART_EXPORT, mockChartExportPNGListener);
        await destroy(chart);
    }
});

test('POST /export/{format}/async/{exportId} returns an error thrown by CHART_EXPORT', async t => {
    const chart = await createChart();

    function mockChartExportListener({ data }) {
        if (data.id === chart.id) {
            throw new CodedError('teapot', 'Test CHART_EXPORT error');
        }
    }

    const { events, event } = t.context.server.app;
    events.on(event.CHART_EXPORT, mockChartExportListener);

    try {
        // Start an asynchronous export.
        const resAsync = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/export/png/async`,
            headers: {
                cookie: `DW-SESSION=${t.context.auth.credentials.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {}
        });
        t.is(resAsync.statusCode, 200);
        const checkUrl = resAsync.result.url;

        // The check if the export has finished should be unsuccessful, because our mock
        // CHART_EXPORT listener immediately threw an error.
        const resCheck = await t.context.server.inject({
            method: 'GET',
            url: checkUrl,
            headers: {
                cookie: `DW-SESSION=${t.context.auth.credentials.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });
        t.is(resCheck.statusCode, 418);
        t.is(resCheck.result.message, 'Test CHART_EXPORT error');
    } finally {
        events.off(event.CHART_EXPORT, mockChartExportListener);
        await destroy(chart);
    }
});
