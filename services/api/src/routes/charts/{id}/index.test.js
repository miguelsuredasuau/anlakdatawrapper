const test = require('ava');
const {
    BASE_URL,
    createChart,
    createUser,
    destroy,
    genNonExistentFolderId,
    setup
} = require('../../../../test/helpers/setup');
const fetch = require('node-fetch');
const get = require('lodash/get');

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

        chart = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.result.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                author_id: null
            }
        });

        t.is(chart.result.authorId, user.id);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
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

test('PUT request returns an error when trying to set inFolder to an unknown folder', async t => {
    let chart;
    try {
        chart = await createChart();

        const { session } = t.context.userObj;
        const putRes = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/charts/${chart.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                inFolder: genNonExistentFolderId()
            }
        });

        t.is(putRes.statusCode, 401);

        const putResCamelCase = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/charts/${chart.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                in_folder: genNonExistentFolderId()
            }
        });

        t.is(putResCamelCase.statusCode, 401);
    } finally {
        await destroy(chart);
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

test('An empty PATCH should not change last_modified_at ', async t => {
    let chart;
    try {
        let chart = (
            await t.context.server.inject({
                method: 'POST',
                url: '/v3/charts',
                auth: t.context.auth,
                headers: t.context.headers
            })
        ).result;

        chart = (
            await t.context.server.inject({
                method: 'GET',
                url: `/v3/charts/${chart.id}`,
                auth: t.context.auth
            })
        ).result;

        // a non-empty patch changes last_modified_at
        let lastModifiedAt = chart.lastModifiedAt;
        await delay(1000);
        chart = (
            await t.context.server.inject({
                method: 'PATCH',
                url: `/v3/charts/${chart.id}`,
                auth: t.context.auth,
                headers: t.context.headers,
                payload: {
                    title: 'New title'
                }
            })
        ).result;
        t.notDeepEqual(lastModifiedAt, chart.lastModifiedAt);

        // an empty patch does not change last_modified_at
        lastModifiedAt = chart.lastModifiedAt;
        await delay(1000);
        chart = (
            await t.context.server.inject({
                method: 'PATCH',
                url: `/v3/charts/${chart.id}`,
                auth: t.context.auth,
                headers: t.context.headers,
                payload: {}
            })
        ).result;
        t.deepEqual(chart.lastModifiedAt, lastModifiedAt);
    } finally {
        if (chart) {
            await destroy(...Object.values(chart));
        }
    }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('PHP GET /charts/{id} returns chart', async t => {
    let userObj = {};
    let chart = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });
        chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2
        });

        const chartId = chart.id;
        t.is(chartId.length, 5);
        const res = await fetch(`${BASE_URL}/charts/${chartId}`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });

        t.is(res.status, 200);
        const json = await res.json();

        t.is(json.status, 'ok');
        t.is(json.data.id.length, 5);
        t.is(json.data.id, chartId);
        t.is(json.data.authorId, chart.author_id);
        t.truthy(json.data.author);
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test("PHP GET /charts/{id} returns an error if user does not have scope 'chart:read'", async t => {
    let userObj = {};
    let chart = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['scope:invalid'] });
        chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2
        });

        const chartId = chart.id;
        t.is(chartId.length, 5);
        const res = await fetch(`${BASE_URL}/charts/${chartId}`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });

        t.is(res.status, 403);
        const json = await res.json();

        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test('PHP GET /charts/{id} returns an error if chart does not exist', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });

        const res = await fetch(`${BASE_URL}/charts/00000`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });

        t.is(res.status, 200);
        const json = await res.json();

        t.is(json.status, 'error');
        t.is(json.code, 'chart-not-found');
    } finally {
        await destroy(Object.values(userObj));
    }
});

test('PHP PUT /charts/{id} can update chart title', async t => {
    let userObj = {};
    let chart = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });
        chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2
        });

        t.is(chart.title, 'Chart 1');

        const res = await fetch(`${BASE_URL}/charts/${chart.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            },
            body: JSON.stringify({
                title: 'New Title'
            })
        });

        t.is(res.status, 200);

        await chart.reload();

        t.is(chart.title, 'New Title');

        const json = await res.json();

        t.is(json.status, 'ok');
        t.truthy(json.data);
        t.is(json.data.title, 'New Title');
    } finally {
        await destroy(Object.values(userObj));
    }
});

test('PHP PUT /charts/{id} replaces entire metadata', async t => {
    let userObj = {};
    let chart = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });
        chart = await createChart({
            organization_id: null,
            author_id: userObj.user.id,
            metadata: {
                describe: {
                    intro: 'hello'
                },
                visualize: {
                    foo: 42
                }
            },
            last_edit_step: 2
        });

        t.is(get(chart.metadata, 'describe.intro'), 'hello');
        t.is(get(chart.metadata, 'visualize.foo'), 42);

        const metadata = {
            visualize: {
                foo: 1
            }
        };

        const res = await fetch(`${BASE_URL}/charts/${chart.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            },
            body: JSON.stringify({
                metadata
            })
        });

        t.is(res.status, 200);

        await chart.reload();

        t.is(get(chart.metadata, 'visualize.foo'), 1);
        t.is(get(chart.metadata, 'describe.intro'), undefined);
        t.is(get(chart.metadata, 'describe.source-name'), undefined);

        const json = await res.json();

        t.is(json.status, 'ok');
        t.truthy(json.data);
        t.is(get(json.data.metadata, 'visualize.foo'), 1);
        // somehow the old PHP endpoint still returns "virtual default" metadata
        t.is(get(json.data.metadata, 'describe.intro'), '');
        t.is(get(json.data.metadata, 'describe.source-name'), '');
    } finally {
        await destroy(Object.values(userObj));
    }
});

test("PHP PUT /charts/{id} can't update chart title if user does not have scope 'chart:read'", async t => {
    let userObj = {};
    let chart = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['scope:invalid'] });
        chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2
        });

        t.is(chart.title, 'Chart 1');

        const res = await fetch(`${BASE_URL}/charts/${chart.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            },
            body: JSON.stringify({
                title: 'New Title'
            })
        });

        t.is(res.status, 403);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test('PHP PUT /charts/{id} returns error if chart not exists', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });

        const res = await fetch(`${BASE_URL}/charts/00000`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            },
            body: JSON.stringify({
                title: 'New Title'
            })
        });

        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'no-such-chart');
    } finally {
        await destroy(Object.values(userObj));
    }
});

test('PHP PUT /charts/{id} returns error if chart belongs to different user', async t => {
    let userObj1 = {};
    let userObj2 = {};
    let chart = {};
    try {
        userObj1 = await createUser(t.context.server, { role: 'editor' });
        userObj2 = await createUser(t.context.server, { role: 'editor' });

        chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj1.user.id,
            last_edit_step: 2
        });

        const res = await fetch(`${BASE_URL}/charts/${chart.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj2.token}`
            },
            body: JSON.stringify({
                title: 'New Title'
            })
        });

        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(chart, Object.values(userObj1), Object.values(userObj2));
    }
});

test('PHP PUT /charts/{id} can update valid type', async t => {
    let userObj = {};
    let chart = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });

        chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2,
            type: 'd3-bars'
        });

        t.is(chart.type, 'd3-bars');

        const res = await fetch(`${BASE_URL}/charts/${chart.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            },
            body: JSON.stringify({
                type: 'd3-lines'
            })
        });

        t.is(res.status, 200);

        await chart.reload();
        t.is(chart.type, 'd3-lines');

        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.type, 'd3-lines');
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test('PUT /charts/{id} allows updating to valid type', async t => {
    let userObj = {};
    let chart = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });

        chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2,
            type: 'd3-bars'
        });

        t.is(chart.type, 'd3-bars');

        t.context.server.app.visualizations.set('d3-lines', { id: 'd3-lines' });

        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            payload: {
                type: 'd3-lines'
            }
        });

        t.context.server.app.visualizations.delete('d3-lines');

        t.is(res.statusCode, 200);
        t.is(res.result.type, 'd3-lines');

        await chart.reload();
        t.is(chart.type, 'd3-lines');
    } finally {
        await destroy(Object.values(userObj));
    }
});

test('PUT /charts/{id} refuses updating to invalid type', async t => {
    let userObj = {};
    let chart = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });

        chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2,
            type: 'd3-bars'
        });

        t.is(chart.type, 'd3-bars');

        const res = (
            await t.context.server.inject({
                method: 'PUT',
                url: `/v3/charts/${chart.id}`,
                auth: t.context.auth,
                payload: {
                    type: 'heatmap'
                }
            })
        ).result;

        t.is(res.statusCode, 400);
        t.is(res.message, 'Invalid chart type');

        await chart.reload();
        t.is(chart.type, 'd3-bars');
    } finally {
        await destroy(Object.values(userObj));
    }
});
