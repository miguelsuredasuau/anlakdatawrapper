const test = require('ava');
const defaultsDeep = require('lodash/defaultsDeep');
const {
    setup,
    BASE_URL,
    createChart,
    createFolder,
    getChart,
    createGuestSession,
    withTeamWithUser,
    withUser
} = require('../../../../test/helpers/setup');
const fetch = require('node-fetch');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
});

test('User can copy chart, attributes match', async t => {
    return withUser(t.context.server, {}, async ({ user, session }) => {
        const headers = {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        };

        const attributes = {
            title: 'This is my chart',
            theme: 'default',
            language: 'en-IE',
            externalData: 'https://static.dwcdn.net/data/12345.csv',
            metadata: {
                visualize: {
                    basemap: 'us-counties'
                }
            }
        };

        // create a new chart
        const srcChart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers,
            payload: attributes
        });

        // copy new chart
        const copiedChart = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${srcChart.result.id}/copy`,
            headers
        });

        const allMetadata = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${copiedChart.result.id}`,
            headers
        });

        const expectedAttributes = defaultsDeep(
            {
                metadata: {
                    data: {},
                    publish: {},
                    describe: {
                        intro: '',
                        'source-name': '',
                        'source-url': '',
                        'aria-description': '',
                        byline: ''
                    }
                }
            },
            attributes
        );

        t.is(copiedChart.statusCode, 201);
        t.is(copiedChart.result.authorId, user.id);
        t.is(copiedChart.result.forkedFrom, srcChart.result.id);
        t.is(allMetadata.result.externalData, attributes.externalData);

        // compare attributes
        for (var attr in attributes) {
            if (attr === 'title') {
                t.is(copiedChart.result[attr], `${expectedAttributes[attr]} (Copy)`);
            } else if (attr === 'metadata') {
                t.is(copiedChart.result.metadata.visualize.basemap, 'us-counties');
            } else {
                t.deepEqual(copiedChart.result[attr], expectedAttributes[attr]);
            }
        }
    });
});

test('User can copy chart, sharing url is updated', async t => {
    return withUser(t.context.server, {}, async ({ session }) => {
        const headers = {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        };

        const attributes = {
            title: 'This is my chart',
            theme: 'default',
            language: 'en-IE',
            externalData: 'https://static.dwcdn.net/data/12345.csv',
            metadata: {
                visualize: {
                    basemap: 'us-counties'
                }
            }
        };

        // create a new chart
        const {
            result: { id: srcChartId, metadata: originalMetadata }
        } = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers,
            payload: attributes
        });

        await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${srcChartId}`,
            headers,
            payload: {
                metadata: defaultsDeep(
                    {
                        visualize: {
                            sharing: {
                                auto: false,
                                url: `https://www.datawrapper.de/_/${srcChartId}`
                            }
                        }
                    },
                    originalMetadata
                )
            }
        });

        // copy new chart
        const copiedChart = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${srcChartId}/copy`,
            headers
        });

        t.is(copiedChart.statusCode, 201);
        t.is(
            copiedChart.result.metadata.visualize.sharing.url,
            `https://www.datawrapper.de/_/${copiedChart.result.id}`
        );
    });
});

test('User can copy chart, custom sharing url is preserved', async t => {
    return withUser(t.context.server, {}, async ({ session }) => {
        const headers = {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        };

        const attributes = {
            title: 'This is my chart',
            theme: 'default',
            language: 'en-IE',
            externalData: 'https://static.dwcdn.net/data/12345.csv',
            metadata: {
                visualize: {
                    basemap: 'us-counties'
                }
            }
        };

        // create a new chart
        const {
            result: { id: srcChartId, metadata: originalMetadata }
        } = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers,
            payload: attributes
        });

        await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/charts/${srcChartId}`,
            headers,
            payload: {
                metadata: defaultsDeep(
                    {
                        visualize: {
                            sharing: {
                                auto: false,
                                url: 'custom url'
                            }
                        }
                    },
                    originalMetadata
                )
            }
        });

        // copy new chart
        const copiedChart = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${srcChartId}/copy`,
            headers
        });

        t.is(copiedChart.statusCode, 201);
        t.is(copiedChart.result.metadata.visualize.sharing.url, 'custom url');
    });
});

test("User cannot copy charts they can't access", async t => {
    return withUser(t.context.server, {}, async userObj => {
        return withUser(t.context.server, {}, async userObj2 => {
            const { session } = userObj;
            const headers = {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            };
            const headers2 = {
                cookie: `DW-SESSION=${userObj2.session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            };

            const attributes = {
                title: 'This is my chart',
                theme: 'default',
                language: 'en-IE',
                externalData: 'https://static.dwcdn.net/data/12345.csv',
                metadata: {
                    visualize: {
                        basemap: 'us-counties'
                    }
                }
            };

            // create a new chart
            const srcChart = await t.context.server.inject({
                method: 'POST',
                url: '/v3/charts',
                headers,
                payload: attributes
            });
            t.is(srcChart.statusCode, 201);

            // copy new chart
            const copiedChart = await t.context.server.inject({
                method: 'POST',
                url: `/v3/charts/${srcChart.result.id}/copy`,
                headers: headers2
            });
            t.is(copiedChart.statusCode, 401);
        });
    });
});

test("User can't copy unpublished charts they can't access, even if team allows it", async t => {
    return withTeamWithUser(t.context.server, {}, async ({ team, session }) => {
        // make sure team allows copying
        await team.update({
            settings: {
                ...team.settings,
                chartTemplates: true
            }
        });

        const headers = {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        };

        const attributes = {
            title: 'This is my chart',
            theme: 'default',
            language: 'en-IE',
            externalData: 'https://static.dwcdn.net/data/12345.csv',
            organizationId: team.id,
            metadata: {
                visualize: {
                    basemap: 'us-counties'
                }
            }
        };

        // create a new chart
        const srcChart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers,
            payload: attributes
        });
        t.is(srcChart.statusCode, 201);

        // create different user
        await withUser(t.context.server, {}, async userObj => {
            const headers2 = {
                cookie: `DW-SESSION=${userObj.session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            };

            // copy new chart
            const copiedChart = await t.context.server.inject({
                method: 'POST',
                url: `/v3/charts/${srcChart.result.id}/copy`,
                headers: headers2
            });

            t.is(copiedChart.statusCode, 404);
        });
    });
});

test("If team allows it, users and guests can copy published charts they can't access (edit in Datawrapper)", async t => {
    return withTeamWithUser(t.context.server, {}, async ({ team, session }) => {
        // make sure team allows copying
        await team.update({
            settings: {
                ...team.settings,
                chartTemplates: true
            }
        });

        const headers = {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        };

        const attributes = {
            title: 'This is my chart',
            theme: 'default',
            language: 'en-IE',
            externalData: 'https://static.dwcdn.net/data/12345.csv',
            organizationId: team.id,
            metadata: {
                visualize: {
                    basemap: 'us-counties'
                }
            }
        };

        // create a new chart
        const srcChart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers,
            payload: attributes
        });
        t.is(srcChart.statusCode, 201);

        // publish src chart
        const publishChart = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${srcChart.result.id}/publish`,
            headers
        });
        t.is(publishChart.statusCode, 200);

        // create different user
        await withUser(t.context.server, {}, async userObj => {
            const headers2 = {
                cookie: `DW-SESSION=${userObj.session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            };

            // copy new chart
            const copiedChart = await t.context.server.inject({
                method: 'POST',
                url: `/v3/charts/${srcChart.result.id}/copy`,
                headers: headers2
            });

            t.is(copiedChart.statusCode, 201);
            t.is(copiedChart.result.forkedFrom, srcChart.result.id);
            // title is identical
            t.is(copiedChart.result.title, srcChart.result.title);
        });

        // try again as guests
        const guestSession = await createGuestSession(t.context.server);
        const copiedChart2 = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${srcChart.result.id}/copy`,
            headers: {
                cookie: `DW-SESSION=${guestSession}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });
        t.is(copiedChart2.statusCode, 201);
        t.is(copiedChart2.result.forkedFrom, srcChart.result.id);
        // title is identical
        t.is(copiedChart2.result.title, srcChart.result.title);
    });
});

test('User can copy chart, assets match', async t => {
    return withUser(t.context.server, {}, async ({ session }) => {
        const csv = `Col1,Col2
        10,20
        15,7`;

        const basemap = { type: 'FeatureCollection', features: [] };

        // create a new chart
        const srcChart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {}
        });

        // write chart data
        const writeData = await t.context.server.inject({
            method: 'PUT',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost',
                'Content-Type': 'text/csv'
            },
            url: `/v3/charts/${srcChart.result.id}/data`,
            payload: csv
        });

        t.is(writeData.statusCode, 204);

        // write custom basemap
        const writeBasemap = await t.context.server.inject({
            method: 'PUT',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost',
                'Content-Type': 'application/json'
            },
            url: `/v3/charts/${srcChart.result.id}/assets/${srcChart.result.id}.map.json`,
            payload: basemap
        });

        t.is(writeBasemap.statusCode, 204);

        // copy new chart
        const copiedChart = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${srcChart.result.id}/copy`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        // compare data
        const copiedData = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${copiedChart.result.id}/data`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(copiedData.result, csv);

        // compare basemap
        const copiedBasemap = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${copiedChart.result.id}/assets/${copiedChart.result.id}.map.json`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(copiedBasemap.result, JSON.stringify(basemap));
    });
});

test('Chart belonging to team duplicates to that team', async t => {
    return withTeamWithUser(t.context.server, {}, async ({ team, session, user }) => {
        const headers = {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        };

        // user creates chart
        const srcChart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers,
            payload: {
                organizationId: team.id
            }
        });

        t.is(srcChart.result.organizationId, team.id);
        t.is(srcChart.result.authorId, user.id);

        // user copies chart
        const copiedChart = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${srcChart.result.id}/copy`,
            headers
        });

        t.is(copiedChart.statusCode, 201);
        t.is(copiedChart.result.authorId, user.id);
        t.is(copiedChart.result.organizationId, team.id);
    });
});

test('Copies made by users are kept in same folder', async t => {
    return withUser(t.context.server, {}, async ({ session, user }) => {
        const folder = await createFolder({ user_id: user.id });
        const csv = `Col1,Col2\n10,20\n15,7`;

        // create a new chart
        const srcChart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                folderId: folder.id
            }
        });

        // write chart data
        const writeData = await t.context.server.inject({
            method: 'PUT',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost',
                'Content-Type': 'text/csv'
            },
            url: `/v3/charts/${srcChart.result.id}/data`,
            payload: csv
        });

        t.is(writeData.statusCode, 204);

        // copy new chart
        const copiedChart = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${srcChart.result.id}/copy`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(copiedChart.statusCode, 201);
        t.is(copiedChart.result.folderId, folder.id);
    });
});

test('Copies made by admins of their own charts are kept in same folder', async t => {
    return withUser(t.context.server, { role: 'admin' }, async ({ session, user }) => {
        const folder = await createFolder({ user_id: user.id });
        const csv = `Col1,Col2\n10,20\n15,7`;

        // create a new chart
        const srcChart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                folderId: folder.id
            }
        });

        // write chart data
        const writeData = await t.context.server.inject({
            method: 'PUT',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost',
                'Content-Type': 'text/csv'
            },
            url: `/v3/charts/${srcChart.result.id}/data`,
            payload: csv
        });

        t.is(writeData.statusCode, 204);

        // copy new chart
        const copiedChart = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${srcChart.result.id}/copy`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(copiedChart.statusCode, 201);
        t.is(copiedChart.result.folderId, folder.id);
    });
});

test('Copies made by admins are stored in their personal root folder ', async t => {
    return withTeamWithUser(t.context.server, {}, async ({ team, session: ownerSession, user }) => {
        return withUser(
            t.context.server,
            { role: 'admin' },
            async ({ session: adminSession, user: adminUser }) => {
                const userHeaders = {
                    cookie: `DW-SESSION=${ownerSession.id}; crumb=abc`,
                    'X-CSRF-Token': 'abc',
                    referer: 'http://localhost'
                };
                const adminHeaders = {
                    cookie: `DW-SESSION=${adminSession.id}; crumb=abc`,
                    'X-CSRF-Token': 'abc',
                    referer: 'http://localhost'
                };

                // user creates chart
                const srcChart = await t.context.server.inject({
                    method: 'POST',
                    url: '/v3/charts',
                    headers: userHeaders,
                    payload: {
                        organizationId: team.id
                    }
                });

                t.is(srcChart.result.organizationId, team.id);
                t.is(srcChart.result.authorId, user.id);

                // admin copies chart
                const copiedChart = await t.context.server.inject({
                    method: 'POST',
                    url: `/v3/charts/${srcChart.result.id}/copy`,
                    headers: adminHeaders
                });

                t.is(copiedChart.statusCode, 201);
                t.is(copiedChart.result.authorId, adminUser.id);
                t.is(copiedChart.result.organizationId, undefined);
            }
        );
    });
});

test('PHP POST /charts/{id}/copy returns error for non existing chart copy', async t => {
    return withUser(t.context.server, { role: 'editor' }, async userObj => {
        const res = await fetch(`${BASE_URL}/charts/00000/copy`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });

        t.is(res.status, 200);

        const json = await res.json();

        t.is(json.status, 'error');
        t.is(json.code, 'no-such-chart');
    });
});

test('PHP POST /charts/{id}/copy creates a copy', async t => {
    return withUser(t.context.server, { role: 'editor' }, async userObj => {
        const chart = await createChart({
            title: 'Chart 1',
            organization_id: null,
            author_id: userObj.user.id,
            last_edit_step: 2
        });

        // upload chart data, otherwise PHP /copy fails
        await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'text/csv'
            },
            body: 'hello,world'
        });

        t.is(chart.title, 'Chart 1');

        const res = await fetch(`${BASE_URL}/charts/${chart.id}/copy`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });

        t.is(res.status, 200);

        const json = await res.json();

        t.is(json.status, 'ok');
        t.truthy(json.data);
        t.truthy(json.data.id);

        const copy = await getChart(json.data.id);
        t.truthy(copy);
        t.is(copy.title, 'Chart 1 (Copy)');
        t.is(copy.is_fork, false);
        t.is(copy.forked_from, chart.id);
    });
});

test('PHP POST /charts/{id}/copy does not allow to copy from anyone', async t => {
    return withUser(t.context.server, { role: 'editor' }, async userObj => {
        return withUser(t.context.server, { role: 'editor' }, async userObj2 => {
            const chart = await createChart({
                title: 'Chart 1',
                organization_id: null,
                author_id: userObj.user.id,
                last_edit_step: 2
            });

            // upload chart data, otherwise PHP /copy fails
            await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
                method: 'PUT',
                headers: {
                    ...t.context.headers,
                    Authorization: `Bearer ${userObj.token}`,
                    'Content-Type': 'text/csv'
                },
                body: 'hello,world'
            });

            t.is(chart.title, 'Chart 1');

            const res = await fetch(`${BASE_URL}/charts/${chart.id}/copy`, {
                method: 'POST',
                headers: {
                    ...t.context.headers,
                    Authorization: `Bearer ${userObj2.token}`
                }
            });

            t.is(res.status, 200);

            const json = await res.json();

            t.is(json.status, 'error');
            t.is(json.code, 'access-denied');
        });
    });
});
