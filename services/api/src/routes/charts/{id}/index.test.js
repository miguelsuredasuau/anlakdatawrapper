const test = require('ava');
const { createChart, createUser, destroy, setup } = require('../../../../test/helpers/setup');

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
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.userObj));
});

test('It should be possible to create, fetch, edit and delete charts', async t => {
    let chart = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers
    });

    t.is(chart.result.authorId, t.context.userObj.user.id);
    t.is(chart.result.id.length, 5);
    t.is(typeof chart.result.metadata, 'object');

    chart = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${chart.result.id}`,
        auth: t.context.auth
    });

    t.truthy(chart.result.authorId);
    t.is(chart.result.id.length, 5);
    t.is(typeof chart.result.author, 'object');

    chart = await t.context.server.inject({
        method: 'PATCH',
        url: `/v3/charts/${chart.result.id}`,
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            title: 'TEST TITLE'
        }
    });

    t.is(chart.result.title, 'TEST TITLE');

    chart = await t.context.server.inject({
        method: 'DELETE',
        url: `/v3/charts/${chart.result.id}`,
        auth: t.context.auth,
        headers: t.context.headers
    });

    t.is(chart.statusCode, 204);
});

test('Admins should see author information', async t => {
    let chart = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers
    });

    chart = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${chart.result.id}`,
        auth: t.context.auth
    });

    t.truthy(chart.result.author);
    t.is(chart.result.author.email, t.context.userObj.user.email);
});

test('Users can not change the author ID of a chart', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { user, session } = userObj;

        let chart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(chart.result.authorId, user.id);

        chart = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.result.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                authorId: null
            }
        });

        t.is(chart.result.authorId, user.id);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('Admin can change author ID of a chart', async t => {
    const { Chart } = require('@datawrapper/orm/models');
    let chartId;
    let newUserObj = {};
    try {
        const { session } = t.context.userObj;
        newUserObj = await createUser(t.context.server);
        const { user: newUser } = newUserObj;

        const res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 201);
        chartId = res.result.id;

        const patchRes = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chartId}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                authorId: newUser.id
            }
        });
        t.is(patchRes.statusCode, 200);
        t.is(patchRes.result.authorId, newUser.id);
    } finally {
        if (chartId) {
            const chart = await Chart.findByPk(chartId);
            await destroy(chart);
        }
        await destroy(...Object.values(newUserObj));
    }
});

test('Users can edit chart medatata', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;

        let chart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
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

        t.is(chart.statusCode, 201);
        t.is(chart.result.metadata.annotate.notes, 'note-1');
        t.log('set new metadata property: ', chart.result.metadata.annotate.notes);

        chart = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.result.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                metadata: {
                    annotate: {
                        notes: 'note-2'
                    },
                    visualize: {
                        'base-color': 'red',
                        'custom-colors': {
                            column1: '#ff0000'
                        }
                    }
                }
            }
        });

        t.is(chart.result.metadata.annotate.notes, 'note-2');
        t.is(chart.result.metadata.visualize['base-color'], 'red');
        t.log('overwrite existing metadata property: ', chart.result.metadata.annotate.notes);

        t.is(chart.result.metadata.visualize['custom-colors'].column1, '#ff0000');

        chart = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.result.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                metadata: {
                    visualize: {
                        'custom-colors': {}
                    }
                }
            }
        });

        t.deepEqual(chart.result.metadata.visualize['custom-colors'], {});
        t.log(
            'set an existing metadata property to empty object: ',
            chart.result.metadata.visualize['custom-colors']
        );

        t.is(chart.result.metadata.annotate.notes, 'note-2');
        t.is(chart.result.metadata.visualize['base-color'], 'red');
        t.log(
            'previously existing metadata property still exists: ',
            chart.result.metadata.annotate.notes
        );

        chart = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.result.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(chart.result.metadata.annotate.notes, 'note-2');
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('PUT request replace metadata', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;

        let chart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                metadata: {
                    annotate: {
                        notes: 'note-1'
                    },
                    visualize: {
                        foo: 'bar'
                    }
                }
            }
        });

        t.is(chart.result.metadata.annotate.notes, 'note-1');
        t.is(chart.result.metadata.visualize.foo, 'bar');

        chart = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/charts/${chart.result.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                metadata: {
                    annotate: {
                        notes: 'note-2'
                    }
                }
            }
        });

        t.is(chart.result.metadata.annotate.notes, 'note-2');
        t.is(chart.result.metadata.visualize, undefined);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('Users can get only published charts, author data is not included', async t => {
    const resChart = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            title: 'Published version'
        }
    });
    const chartId = resChart.result.id;
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;

        const resUnpublishedChart = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chartId}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`
            }
        });

        t.is(resUnpublishedChart.statusCode, 401);

        await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chartId}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        await t.context.server.inject({
            method: 'PUT',
            url: `/v3/charts/${chartId}`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                title: 'New version'
            }
        });

        const resPublishedChart = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chartId}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`
            }
        });

        t.is(resPublishedChart.statusCode, 200);
        t.is(resPublishedChart.result.id, resChart.result.id);
        t.is(resPublishedChart.result.title, 'Published version');
        t.is(resPublishedChart.author, undefined);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('An identical PATCH does not change last_modified_at', async t => {
    let chartId;
    try {
        const payload = {
            externalData: 'https://www.example.com/data',
            forkable: true,
            language: 'pt_BR',
            lastEditStep: 3,
            metadata: {
                foo: {
                    bar: 'spam'
                }
            },
            theme: 'my-theme',
            title: 'Chart 1',
            type: 'd3-bars'
        };
        const res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            auth: t.context.auth,
            headers: t.context.headers,
            payload
        });
        chartId = res.result.id;

        const origChart = (
            await t.context.server.inject({
                method: 'GET',
                url: `/v3/charts/${chartId}`,
                auth: t.context.auth
            })
        ).result;

        // an different patch changes last_modified_at
        await delay(1000);
        const modifiedChart = (
            await t.context.server.inject({
                method: 'PATCH',
                url: `/v3/charts/${chartId}`,
                auth: t.context.auth,
                headers: t.context.headers,
                payload: {
                    ...payload,
                    title: 'New title'
                }
            })
        ).result;
        t.notDeepEqual(origChart.lastModifiedAt, modifiedChart.lastModifiedAt);

        // an identical patch does not change last_modified_at
        await delay(1000);
        const notModifiedChart = (
            await t.context.server.inject({
                method: 'PATCH',
                url: `/v3/charts/${chartId}`,
                auth: t.context.auth,
                headers: t.context.headers,
                payload: {
                    ...payload,
                    title: 'New title'
                }
            })
        ).result;
        t.deepEqual(modifiedChart.lastModifiedAt, notModifiedChart.lastModifiedAt);
    } finally {
        if (chartId) {
            const { Chart } = require('@datawrapper/orm/models');
            const chart = await Chart.findByPk(chartId);
            await destroy(chart);
        }
    }
});

test('POST does not allow setting author id', async t => {
    const res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            author_id: t.context.userObj.user.id
        }
    });
    t.is(res.statusCode, 400);
});

test('POST does not allow setting fork information', async t => {
    let res;
    res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            forkedFrom: 'XXXXX'
        }
    });
    t.is(res.statusCode, 400);

    res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            isFork: true
        }
    });
    t.is(res.statusCode, 400);
});

test('POST does not allow setting publishing information', async t => {
    let res;
    res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            publicUrl: 'https://www.example.com/chart'
        }
    });
    t.is(res.statusCode, 400);

    res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            publicVersion: 123
        }
    });
    t.is(res.statusCode, 400);

    res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            publishedAt: new Date()
        }
    });
    t.is(res.statusCode, 400);
});

test('PATCH ignores fork information when called by normal user', async t => {
    const { Chart } = require('@datawrapper/orm/models');
    let chart;
    let forkedFromChart;
    let userObj = {};
    try {
        userObj = await createUser(t.context.server);
        const { session, user } = userObj;
        forkedFromChart = await createChart();
        chart = await createChart({
            author_id: user.id
        });

        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                title: 'New Title',
                forkedFrom: forkedFromChart.id,
                isFork: true
            }
        });
        t.is(res.statusCode, 200);

        chart = await Chart.findByPk(chart.id);
        t.is(chart.title, 'New Title');
        t.is(chart.forked_from, null);
        t.is(chart.is_fork, false);
    } finally {
        await destroy(chart, forkedFromChart);
    }
});

test('PATCH updates fork information when called by admin', async t => {
    const { Chart } = require('@datawrapper/orm/models');
    let chart;
    let forkedFromChart;
    try {
        forkedFromChart = await createChart();
        chart = await createChart({});

        let res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                title: 'Title 1',
                forkedFrom: forkedFromChart.id
            }
        });
        t.is(res.statusCode, 200);

        res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                title: 'Title 2',
                isFork: true
            }
        });
        t.is(res.statusCode, 200);

        chart = await Chart.findByPk(chart.id);
        t.is(chart.title, 'Title 2');
        t.is(chart.forked_from, forkedFromChart.id);
        t.is(chart.is_fork, true);
    } finally {
        await destroy(chart, forkedFromChart);
    }
});

test('PATCH sets publishing information', async t => {
    const { Chart } = require('@datawrapper/orm/models');
    let chart;
    try {
        const oldDate = new Date(2010, 1, 1);
        chart = await createChart({
            public_url: 'https://www.example.com/old',
            public_version: 1,
            published_at: oldDate,
            last_edit_step: 1,
            metadata: {
                foo: 'old value',
                publish: {
                    'embed-codes': {
                        foo: 'old embed code'
                    }
                }
            }
        });

        const newDate = new Date(2020, 2, 2);
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                title: 'New Title',
                publicUrl: 'https://www.example.com/new',
                publicVersion: 2, // Notice that it's greater or equal than chart.public_version.
                publishedAt: newDate,
                lastEditStep: 4,
                metadata: {
                    foo: 'new value',
                    publish: {
                        'embed-codes': {
                            foo: 'new embed code'
                        }
                    }
                }
            }
        });
        t.is(res.statusCode, 200);

        chart = await Chart.findByPk(chart.id);
        t.is(chart.title, 'New Title');
        t.is(chart.public_url, 'https://www.example.com/new');
        t.is(chart.public_version, 2);
        t.deepEqual(chart.published_at, newDate);
        t.is(chart.last_edit_step, 4);
        t.deepEqual(chart.metadata, {
            foo: 'new value',
            publish: {
                'embed-codes': {
                    foo: 'new embed code'
                }
            }
        });
    } finally {
        await destroy(chart);
    }
});

test('PATCH does not overwrite earlier publishing information', async t => {
    const { Chart } = require('@datawrapper/orm/models');
    let chart;
    try {
        const oldDate = new Date(2010, 1, 1);
        chart = await createChart({
            public_url: 'https://www.example.com/old',
            public_version: 3,
            published_at: oldDate,
            last_edit_step: 1,
            metadata: {
                foo: 'old value',
                publish: {
                    'embed-codes': {
                        foo: 'old embed code'
                    }
                }
            }
        });

        const newDate = new Date(2020, 2, 2);
        const patchRes = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                title: 'New Title',
                publicUrl: 'https://www.example.com/new',
                publicVersion: 2, // Notice that it's less than chart.public_version.
                publishedAt: newDate,
                lastEditStep: 4,
                metadata: {
                    foo: 'new value',
                    publish: {
                        'embed-codes': {
                            foo: 'new embed code'
                        }
                    }
                }
            }
        });
        t.is(patchRes.statusCode, 200);

        chart = await Chart.findByPk(chart.id);
        t.is(chart.title, 'New Title');
        t.is(chart.public_url, 'https://www.example.com/old');
        t.is(chart.public_version, 3);
        t.deepEqual(chart.published_at, oldDate);
        t.is(chart.last_edit_step, 1);
        t.deepEqual(chart.metadata, {
            foo: 'new value',
            publish: {
                'embed-codes': {
                    foo: 'old embed code'
                }
            }
        });
    } finally {
        await destroy(chart);
    }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
