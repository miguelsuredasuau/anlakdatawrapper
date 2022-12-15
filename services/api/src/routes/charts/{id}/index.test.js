const test = require('ava');
const { Chart, UserData } = require('@datawrapper/orm/db');
const {
    BASE_URL,
    addUserToTeam,
    createChart,
    createFolder,
    createTeamWithUser,
    createUser,
    destroy,
    genNonExistentFolderId,
    setup,
    withChart,
    withUser
} = require('../../../../test/helpers/setup');
const fetch = require('node-fetch');
const get = require('lodash/get');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function findChartById(id) {
    return Chart.findByPk(id);
}

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

test('Users can edit chart metadata', async t => {
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
        t.is(chart.result.metadata.visualize.foo, undefined);
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

test('An empty PATCH should not change last_modified_at', async t => {
    let chart;
    try {
        chart = (
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

test('PATCH returns error 400 when the metadata contains a too long JSON object key', async t => {
    let chart;
    try {
        const { user } = t.context.userObj;
        chart = await createChart({ author_id: user.id });

        const resGood = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                metadata: {
                    ['a'.repeat(2 ** 16 - 1)]: 'b'
                }
            }
        });
        t.is(resGood.statusCode, 200);

        const resBad = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                metadata: {
                    ['a'.repeat(2 ** 16)]: 'b'
                }
            }
        });
        t.is(resBad.statusCode, 400);
        t.true(resBad.result.message.includes('Invalid JSON'));
    } finally {
        if (chart) {
            await destroy(...Object.values(chart));
        }
    }
});

test('PATCH returns error 400 when the metadata contains an invalid UTF-16', async t => {
    let chart;
    try {
        const { user } = t.context.userObj;
        chart = await createChart({ author_id: user.id });

        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                metadata: {
                    // This testing string is invalid UTF-16, because it misses the tail surrogate.
                    // See https://mnaoumov.wordpress.com/2014/06/14/stripping-invalid-characters-from-utf-16-strings/
                    a: '\ud800b'
                }
            }
        });
        t.is(res.statusCode, 400);
        t.true(res.result.message.includes('Invalid JSON'));
    } finally {
        if (chart) {
            await destroy(...Object.values(chart));
        }
    }
});

test('PATCH returns error 400 when the metadata is nested too deeply', async t => {
    const createNestedMetadata = (levels, obj) => {
        const metadata = {
            metadata: { ...obj }
        };
        if (!levels) {
            return metadata;
        }
        return createNestedMetadata(levels - 1, metadata);
    };
    let chart;
    try {
        const { user } = t.context.userObj;
        chart = await createChart({ author_id: user.id });
        const metadata = createNestedMetadata(99, {});
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                metadata
            }
        });
        t.is(res.statusCode, 400);
        t.true(res.result.message.includes('Invalid JSON'));
    } finally {
        if (chart) {
            await destroy(...Object.values(chart));
        }
    }
});

test('PATCH with organizationId payload reassigns chart to requesting user when original author not in target team', async t => {
    let teamObj1, teamObj2, chart;
    try {
        teamObj1 = await createTeamWithUser(t.context.server);
        teamObj2 = await createTeamWithUser(t.context.server);

        const { user: user1, team: team1, session: session1 } = teamObj1;
        const { user: user2, team: team2, session: session2 } = teamObj2;

        // add user2 to team1
        await addUserToTeam(user2, team1);

        // create user1 chart in team1
        chart = await createChart({ organization_id: team1.id, author_id: user1.id });

        // user1 can access chart
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}`,
            headers: {
                cookie: `DW-SESSION=${session1.id}`
            }
        });

        t.is(res.statusCode, 200);

        // user2 moves user1's chart to team2
        const res2 = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            headers: {
                cookie: `DW-SESSION=${session2.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                organizationId: team2.id
            }
        });

        // author_id has been updated
        t.is(res2.statusCode, 200);
        t.is(res2.result.authorId, user2.id);

        // user1 can no longer access chart
        const res3 = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}`,
            headers: {
                cookie: `DW-SESSION=${session1.id}`
            }
        });

        t.is(res3.statusCode, 401);
    } finally {
        destroy(chart, ...Object.values(teamObj1), ...Object.values(teamObj2));
    }
});

test("PATCH with folderId payload reassigns chart to requesting user when original author not in target folder's team", async t => {
    let teamObj1, teamObj2, chart, folder;
    try {
        teamObj1 = await createTeamWithUser(t.context.server);
        teamObj2 = await createTeamWithUser(t.context.server);

        const { user: user1, team: team1, token: token1 } = teamObj1;
        const { user: user2, team: team2, token: token2 } = teamObj2;

        // add user2 is in team1 and team2
        await addUserToTeam(user2, team1);
        // create user1 chart in team1
        chart = await createChart({
            organization_id: team1.id,
            author_id: user1.id,
            in_folder: null
        });

        // create folder in team2
        folder = await createFolder({ org_id: team2.id, user_id: null });

        // user1 can access chart
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}`,
            headers: {
                authorization: `Bearer ${token1}`
            }
        });

        t.is(res.statusCode, 200);

        // user2 moves user1's chart to folder in team2
        const res1 = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            headers: {
                authorization: `Bearer ${token2}`
            },
            payload: {
                folderId: folder.id
            }
        });

        t.is(res1.statusCode, 200);
        // author_id has been updated
        t.is(res1.result.authorId, user2.id);
        t.is(res1.result.folderId, folder.id);
        t.is(res1.result.organizationId, team2.id);

        const res3 = await findChartById(chart.id);
        t.is(res3.author_id, user2.id);
        t.is(res3.in_folder, folder.id);
        t.is(res3.organization_id, team2.id);
    } finally {
        destroy(chart, folder, ...Object.values(teamObj1), ...Object.values(teamObj2));
    }
});

test("PATCH from admin with organizationId payload reassigns chart to target team's owner when original author not in target team", async t => {
    let adminUserObj, userTeamObj, userTeamObj2, chart;
    try {
        adminUserObj = await createUser(t.context.server, { role: 'admin' });
        userTeamObj = await createTeamWithUser(t.context.server);
        userTeamObj2 = await createTeamWithUser(t.context.server);

        const { user: user1, team: team1, session: session1 } = userTeamObj;
        const { user: user2, team: team2 } = userTeamObj2;
        const { session: adminSession } = adminUserObj;

        // user1 creates chart in user team1
        chart = await createChart({ organization_id: team1.id, author_id: user1.id });

        // user1 can access chart
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}`,
            headers: {
                cookie: `DW-SESSION=${session1.id}`
            }
        });

        t.is(res.statusCode, 200);
        t.is(res.result.organizationId, team1.id);
        t.is(res.result.authorId, user1.id);

        // adminUser moves user1's chart to different team
        const res2 = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            headers: {
                cookie: `DW-SESSION=${adminSession.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                organizationId: team2.id
            }
        });

        // author_id has been updated to team2's owner
        t.is(res2.statusCode, 200);
        t.is(res2.result.authorId, user2.id);

        // original chart author can no longer access chart
        const res3 = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}`,
            headers: {
                cookie: `DW-SESSION=${user1.id}`
            }
        });

        t.is(res3.statusCode, 401);
    } finally {
        destroy(
            chart,
            ...Object.values(adminUserObj),
            ...Object.values(userTeamObj),
            ...Object.values(userTeamObj2)
        );
    }
});

test('PATCH from admin with organizationId payload returns error when original chart author does not have access to target team, and target team has no owner', async t => {
    let adminUserObj, userTeamObj, userTeamObj2, chart;
    try {
        adminUserObj = await createUser(t.context.server, { role: 'admin' });
        userTeamObj = await createTeamWithUser(t.context.server);
        userTeamObj2 = await createTeamWithUser(t.context.server, { role: 'member' });

        const { user: user1, team: team1 } = userTeamObj;
        const { team: team2 } = userTeamObj2;
        const { token: adminToken } = adminUserObj;

        // user1 creates chart in user team1
        chart = await createChart({ organization_id: team1.id, author_id: user1.id });

        // adminUser tries to move user1's chart to different team
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            headers: {
                authorization: `Bearer ${adminToken}`
            },
            payload: {
                organizationId: team2.id
            }
        });

        t.is(res.statusCode, 400);
    } finally {
        destroy(
            chart,
            ...Object.values(adminUserObj),
            ...Object.values(userTeamObj),
            ...Object.values(userTeamObj2)
        );
    }
});

test('PATCH from admin with authorId payload returns error when specified user does not have access to the chart team', async t => {
    let adminUserObj, userTeamObj, userObj, chart;
    try {
        adminUserObj = await createUser(t.context.server, { role: 'admin' });
        userTeamObj = await createTeamWithUser(t.context.server);
        userObj = await createUser(t.context.server);

        const { user } = userObj;
        const { team } = userTeamObj;
        const { token: adminToken } = adminUserObj;
        const chart = await createChart({ author_id: user.id, organization_id: team.id });

        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            headers: {
                authorization: `Bearer ${adminToken}`
            },
            payload: {
                authorId: user.id
            }
        });

        t.is(res.statusCode, 400);
        const chartAfterRequest = await findChartById(chart.id);
        t.is(chartAfterRequest.author_id, chart.author_id);
        t.is(chartAfterRequest.organization_id, chart.organization_id);
    } finally {
        destroy(
            chart,
            ...Object.values(adminUserObj),
            ...Object.values(userTeamObj),
            ...Object.values(userObj)
        );
    }
});

test('PATCH from admin with authorId and organizationId payload returns error when specified user does not have access to specified team', async t => {
    let adminUserObj, userTeamObj, userObj, userTeamObj2, chart;
    try {
        adminUserObj = await createUser(t.context.server, { role: 'admin' });
        userTeamObj = await createTeamWithUser(t.context.server);
        userTeamObj2 = await createTeamWithUser(t.context.server);
        userObj = await createUser(t.context.server);

        const { user } = userObj;
        const { team } = userTeamObj;
        const { user: user2, team: team2 } = userTeamObj2;
        const { token: adminToken } = adminUserObj;

        const chart = await createChart({
            author_id: user2.id,
            organization_id: team2.id
        });

        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            headers: {
                authorization: `Bearer ${adminToken}`
            },
            payload: {
                authorId: user.id,
                organization_id: team.id
            }
        });

        t.is(res.statusCode, 400);

        const chartAfterRequest = await findChartById(chart.id);

        t.is(chartAfterRequest.author_id, chart.author_id);
        t.is(chartAfterRequest.organization_id, chart.organization_id);
    } finally {
        destroy(
            chart,
            ...Object.values(adminUserObj),
            ...Object.values(userTeamObj),
            ...Object.values(userTeamObj2),
            ...Object.values(userObj)
        );
    }
});

test('PATCH with null value removes key from metadata', async t => {
    let userObj = {},
        chart;
    try {
        userObj = await createUser(t.context.server);

        // user creates chart
        chart = await createChart({
            author_id: userObj.user.id,
            metadata: {
                axes: [],
                describe: {},
                visualize: {
                    'keep-me': 'foo',
                    'remove-me': 42
                },
                annotate: {}
            }
        });

        // user tries to remove the `remove-me` key
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${chart.id}`,
            headers: {
                authorization: `Bearer ${userObj.token}`
            },
            payload: {
                metadata: {
                    visualize: {
                        'remove-me': null
                    }
                }
            }
        });

        t.is(res.statusCode, 200);
        t.is(res.result.metadata.visualize['keep-me'], 'foo');
        t.is(res.result.metadata.visualize['remove-me'], undefined);

        await chart.reload();
        t.is(chart.metadata.visualize['keep-me'], 'foo');
        t.is(chart.metadata.visualize['remove-me'], undefined);
    } finally {
        destroy(chart, ...Object.values(userObj));
    }
});

test('PATCH /charts/{id} updates recently_edited user data when several charts have been edited', async t => {
    await withUser(t.context.server, {}, async ({ token, user }) => {
        await withChart(
            {
                author_id: user.id
            },
            async chart1 => {
                const res = await t.context.server.inject({
                    method: 'PATCH',
                    url: `/v3/charts/${chart1.id}`,
                    headers: {
                        authorization: `Bearer ${token}`
                    },
                    payload: {
                        title: 'New title 1'
                    }
                });
                t.is(res.statusCode, 200);

                await withChart(
                    {
                        author_id: user.id
                    },
                    async chart2 => {
                        const res = await t.context.server.inject({
                            method: 'PATCH',
                            url: `/v3/charts/${chart2.id}`,
                            headers: {
                                authorization: `Bearer ${token}`
                            },
                            payload: {
                                title: 'New title 2'
                            }
                        });
                        t.is(res.statusCode, 200);

                        const recentlyEdited = await UserData.getUserData(
                            user.id,
                            'recently_edited'
                        );
                        t.deepEqual(JSON.parse(recentlyEdited), [chart2.id, chart1.id]);
                    }
                );
            }
        );
    });
});

test('PATCH /charts/{id} updates recently_edited user data when it is empty', async t => {
    await withUser(t.context.server, {}, async ({ token, user }) => {
        await withChart(
            {
                author_id: user.id
            },
            async chart => {
                const res = await t.context.server.inject({
                    method: 'PATCH',
                    url: `/v3/charts/${chart.id}`,
                    headers: {
                        authorization: `Bearer ${token}`
                    },
                    payload: {
                        title: 'New title'
                    }
                });
                t.is(res.statusCode, 200);

                const recentlyEdited = await UserData.getUserData(user.id, 'recently_edited');
                t.deepEqual(JSON.parse(recentlyEdited), [chart.id]);
            }
        );
    });
});

test('PATCH /charts/{id} overwrites malformed recently_edited user data', async t => {
    await withUser(t.context.server, {}, async ({ token, user }) => {
        await withChart(
            {
                author_id: user.id
            },
            async chart => {
                await UserData.setUserData(user.id, 'recently_edited', '{malformed');
                const resMalformed = await t.context.server.inject({
                    method: 'PATCH',
                    url: `/v3/charts/${chart.id}`,
                    headers: {
                        authorization: `Bearer ${token}`
                    },
                    payload: {
                        title: 'New title 1'
                    }
                });
                t.is(resMalformed.statusCode, 200);

                const recentlyEditedMalformed = await UserData.getUserData(
                    user.id,
                    'recently_edited'
                );
                t.deepEqual(JSON.parse(recentlyEditedMalformed), [chart.id]);

                await UserData.setUserData(user.id, 'recently_edited', '"not array"');

                const resNotArray = await t.context.server.inject({
                    method: 'PATCH',
                    url: `/v3/charts/${chart.id}`,
                    headers: {
                        authorization: `Bearer ${token}`
                    },
                    payload: {
                        title: 'New title 2'
                    }
                });
                t.is(resNotArray.statusCode, 200);

                const recentlyEditedNotArray = await UserData.getUserData(
                    user.id,
                    'recently_edited'
                );
                t.deepEqual(JSON.parse(recentlyEditedNotArray), [chart.id]);
            }
        );
    });
});

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

test("PHP PUT /charts/{id} can't update chart title if user does not have scope 'chart:write'", async t => {
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
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });

        const chart = await createChart({
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

test('PHP DELETE /charts/{id} can delete a chart', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });

        const chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2
        });
        await chart.reload(); // reload the chart to fetch all attributes
        t.is(chart.deleted, false);

        const res = await fetch(`${BASE_URL}/charts/${chart.id}`, {
            method: 'DELETE',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });

        t.is(res.status, 200);

        await chart.reload();
        t.is(chart.deleted, true);

        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data, '');
    } finally {
        await destroy(Object.values(userObj));
    }
});

test('PHP DELETE /charts/{id} returns error if trying to delete non-existing chart', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });

        const res = await fetch(`${BASE_URL}/charts/00000`, {
            method: 'DELETE',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });

        t.is(res.status, 200);

        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'no-such-chart');
    } finally {
        await destroy(Object.values(userObj));
    }
});

test('PHP DELETE /charts/{id} returns error if chart belongs to different user', async t => {
    let userObj1 = {};
    let userObj2 = {};
    try {
        userObj1 = await createUser(t.context.server, { role: 'editor' });
        userObj2 = await createUser(t.context.server, { role: 'editor' });

        const chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj1.user.id,
            last_edit_step: 2
        });

        const res = await fetch(`${BASE_URL}/charts/${chart.id}`, {
            method: 'DELETE',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj2.token}`
            }
        });

        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(Object.values(userObj1), Object.values(userObj2));
    }
});

test("PHP DELETE /charts/{id} can't delete chart if user does not have scope 'chart:write'", async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['scope:invalid'] });
        const chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2
        });

        t.is(chart.title, 'Chart 1');

        const res = await fetch(`${BASE_URL}/charts/${chart.id}`, {
            method: 'DELETE',
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
        await destroy(Object.values(userObj));
    }
});
