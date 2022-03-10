const test = require('ava');
const {
    BASE_URL,
    createUser,
    destroy,
    setup,
    createChart,
    createTeam
} = require('../../../../test/helpers/setup');
const fetch = require('node-fetch');
const set = require('lodash/set');
const tmp = require('tmp');
const fs = require('fs');
const FormData = require('form-data');

async function getData(server, session, chart) {
    return server.inject({
        method: 'GET',
        headers: {
            cookie: `DW-SESSION=${session.id}`
        },
        url: `/v3/charts/${chart.id}/data`
    });
}

async function getAsset(server, session, chart, asset) {
    return server.inject({
        method: 'GET',
        headers: {
            cookie: `DW-SESSION=${session.id}`
        },
        url: `/v3/charts/${chart.id}/assets/${asset}`
    });
}

async function putData(server, session, chart, data, contentType = 'text/csv') {
    return server.inject({
        method: 'PUT',
        headers: {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost',
            'Content-Type': contentType
        },
        url: `/v3/charts/${chart.id}/data`,
        payload: data
    });
}

async function putAsset(server, session, chart, asset, data, contentType = 'text/csv') {
    return server.inject({
        method: 'PUT',
        headers: {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost',
            'Content-Type': contentType
        },
        url: `/v3/charts/${chart.id}/assets/${asset}`,
        payload: data
    });
}

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

test('User can read and write chart data', async t => {
    let chart;
    let userObj = {};
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;

        // create a new chart with no data
        chart = await createChart({ author_id: userObj.user.id });

        // check that the 'data' enpoint returns error 200 and null when there is no chart data
        let res = await getData(t.context.server, session, chart);
        t.is(res.statusCode, 200);
        t.is(res.result, null);

        // set chart data
        res = await putData(t.context.server, session, chart, 'hello world');
        t.is(res.statusCode, 204);

        // check that the 'data' endpoint returns the CSV data and the headers are correct
        res = await getData(t.context.server, session, chart);
        t.is(res.statusCode, 200);
        t.is(res.result, 'hello world');
        t.is(res.headers['content-type'], 'text/csv; charset=utf-8');
        t.is(res.headers['content-disposition'], `${chart.id}.csv`);

        // check that the 'assets' endpoint returns the CSV data too
        res = await getAsset(t.context.server, session, chart, `${chart.id}.csv`);
        t.is(res.statusCode, 200);
        t.is(res.result, 'hello world');

        // make sure we can't access data for a different chart id
        res = await getAsset(t.context.server, session, chart, '00000.csv');
        t.is(res.statusCode, 400);

        // write some JSON to another asset
        res = await putAsset(
            t.context.server,
            session,
            chart,
            `${chart.id}.map.json`,
            { answer: 42 },
            'application/json'
        );
        t.is(res.statusCode, 204);

        // check that the 'assets' endpoint returns the JSON data
        res = await getAsset(t.context.server, session, chart, `${chart.id}.map.json`);
        t.is(res.statusCode, 200);
        t.deepEqual(JSON.parse(res.result), { answer: 42 });
    } finally {
        await destroy(chart, ...Object.values(userObj));
    }
});

test('GET /charts/{id}/data returns JSON data with JSON headers when the data is an array or an object', async t => {
    let chart;
    try {
        const { session, user } = t.context.userObj;
        chart = await createChart({ author_id: user.id });
        await putData(t.context.server, session, chart, JSON.stringify({ answer: 42 }));

        const res = await getData(t.context.server, session, chart);
        t.is(res.statusCode, 200);
        t.deepEqual(JSON.parse(res.result), { answer: 42 });
        t.is(res.headers['content-type'], 'application/json; charset=utf-8');
        t.is(res.headers['content-disposition'], `${chart.id}.json`);

        await putData(t.context.server, session, chart, JSON.stringify([42]));

        const res2 = await getData(t.context.server, session, chart);
        t.is(res2.statusCode, 200);
        t.deepEqual(JSON.parse(res2.result), [42]);
        t.is(res2.headers['content-type'], 'application/json; charset=utf-8');
        t.is(res2.headers['content-disposition'], `${chart.id}.json`);
    } finally {
        await destroy(chart);
    }
});

test('GET /charts/{id}/data returns JSON data with CSV headers when the data is a number or a string', async t => {
    let chart;
    try {
        const { session, user } = t.context.userObj;
        chart = await createChart({ author_id: user.id });
        await putData(t.context.server, session, chart, '42');

        const res = await getData(t.context.server, session, chart);
        t.is(res.statusCode, 200);
        t.is(res.result, '42');
        t.is(res.headers['content-type'], 'text/csv; charset=utf-8');
        t.is(res.headers['content-disposition'], `${chart.id}.csv`);

        await putData(t.context.server, session, chart, 'fourty two');
        const res2 = await getData(t.context.server, session, chart);
        t.is(res2.statusCode, 200);
        t.is(res2.result, 'fourty two');
        t.is(res2.headers['content-type'], 'text/csv; charset=utf-8');
        t.is(res2.headers['content-disposition'], `${chart.id}.csv`);
    } finally {
        await destroy(chart);
    }
});

test('PHP GET /charts/{id}/data returns chart data', async t => {
    let userObj = {};
    let chart;
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:read'] });
        chart = await createChart({
            author_id: userObj.user.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 200);
        t.assert(res.headers.get('content-type').includes('text/csv'));
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test("PHP GET /charts/{id}/data returns an error if user does not have scope 'chart:read'", async t => {
    let userObj = {};
    let chart;
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['scope:invalid'] });
        chart = await createChart({
            author_id: userObj.user.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
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

test('PHP GET /charts/{id}/data returns an error if chart does not exist', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:read'] });
        const res = await fetch(`${BASE_URL}/charts/00000/data`, {
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
test('PHP GET /charts/{id}/data returns an error if user does not have access to chart', async t => {
    let userObj = {};
    let chart;
    let team;
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:read'] });
        team = await createTeam();
        chart = await createChart({
            organization_id: team.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(chart, team, Object.values(userObj));
    }
});

test('PHP PUT /charts/{id}/data sets the chart data with CSV', async t => {
    let userObj = {};
    let chart;
    const expectedCsv = 'test,data';
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:write', 'chart:read']
        });
        chart = await createChart({
            author_id: userObj.user.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'text/csv'
            },
            body: expectedCsv
        });
        t.is(res.status, 200);
        const actual = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        const csv = await actual.text();
        t.assert(csv.includes(expectedCsv)); // the new csv data seems to be prepended with a line break ('\n'), hence the includes check
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test('PHP PUT /charts/{id}/data sets the chart data with JSON', async t => {
    let userObj = {};
    let chart;
    const expectedData = {
        test: 'data'
    };
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:write', 'chart:read']
        });
        chart = await createChart({
            author_id: userObj.user.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expectedData)
        });
        t.is(res.status, 200);
        const actual = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        const json = await actual.json();
        t.deepEqual(json, expectedData);
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test('PHP PUT /charts/{id}/data even accepts invalid json', async t => {
    let userObj = {};
    let chart;
    const expectedCsv = 'hello, world';
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:write', 'chart:read']
        });
        chart = await createChart({
            author_id: userObj.user.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'application/json'
            },
            body: expectedCsv
        });
        t.is(res.status, 200);
        const actual = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        const csv = await actual.text();
        t.assert(csv.includes(expectedCsv)); // the new csv data seems to be prepended with a line break ('\n'), hence the includes check
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test("PHP PUT /charts/{id}/data returns an error if user does not have scope 'chart:write'", async t => {
    let userObj = {};
    let chart;
    const expectedCsv = 'test,data';
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:read'] });
        chart = await createChart({
            author_id: userObj.user.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'text/csv'
            },
            body: expectedCsv
        });
        t.is(res.status, 403);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test('PHP PUT /charts/{id}/data returns an error if user cannot access chart', async t => {
    let userObj = {};
    let team;
    let chart;
    const expectedCsv = 'test,data';
    try {
        team = await createTeam();
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:read', 'chart:write']
        });
        chart = await createChart({
            organization_id: team.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'text/csv'
            },
            body: expectedCsv
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(chart, team, Object.values(userObj));
    }
});
test('PHP PUT /charts/{id}/data returns an error if chart does not exist', async t => {
    let userObj = {};
    const expectedCsv = 'test,data';
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:write'] });
        const res = await fetch(`${BASE_URL}/charts/00000/data`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'text/csv'
            },
            body: expectedCsv
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'no-such-chart');
    } finally {
        await destroy(Object.values(userObj));
    }
});
test.skip('PHP PUT /charts/{id}/data returns an error if chart is a fork', async t => {
    let userObj = {};
    let chart;
    const expectedCsv = 'test,data';
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:write'] });
        chart = await createChart({
            author_id: userObj.user.id,
            is_fork: true
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'text/csv'
            },
            body: expectedCsv
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'read-only');
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test.skip('PHP PUT /charts/{id}/data returns an error if chart metadata custom.webToPrint.mode is print', async t => {
    let userObj = {};
    let chart;
    const expectedCsv = 'test,data';
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:write'] });
        const metadata = set({}, 'custom.webToPrint.mode', 'print');
        chart = await createChart({
            author_id: userObj.user.id,
            metadata
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'text/csv'
            },
            body: expectedCsv
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'read-only');
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

async function testFileUpload(t, postfix = '.csv') {
    let userObj = {};
    let chart;
    let tmpFile;
    const expectedData = 'test,data';
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:write', 'chart:read']
        });
        chart = await createChart({
            author_id: userObj.user.id
        });
        tmpFile = tmp.fileSync({ postfix });
        fs.writeFileSync(tmpFile.name, expectedData);

        const formData = new FormData();
        formData.append('qqfile', fs.createReadStream(tmpFile.name));
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userObj.token}`
            },
            body: formData
        });

        t.is(res.status, 200);
        const actual = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        const csv = await actual.text();
        t.assert(csv.includes(expectedData)); // the new csv data seems to be prepended with a line break ('\n'), hence the includes check
    } finally {
        await destroy(chart, Object.values(userObj));
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
}

test('PHP POST /charts/{id}/data accepts a .csv file upload', testFileUpload, '.csv');

test('PHP POST /charts/{id}/data accepts a .txt file upload', testFileUpload, '.txt');

test('PHP POST /charts/{id}/data accepts a .tsv file upload', testFileUpload, '.tsv');

test('PHP POST /charts/{id}/data returns an error if no file is uploaded', async t => {
    let userObj = {};
    let chart;
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:write', 'chart:read']
        });
        chart = await createChart({
            author_id: userObj.user.id
        });

        const formData = new FormData();
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userObj.token}`
            },
            body: formData
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'upload-error');
        t.is(json.message, 'No files were uploaded.');
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test('PHP POST /charts/{id}/data returns an error if file with invalid extension is uploaded', async t => {
    let userObj = {};
    let chart;
    let tmpFile;
    const expectedData = 'test,data';
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:write', 'chart:read']
        });
        chart = await createChart({
            author_id: userObj.user.id
        });
        tmpFile = tmp.fileSync({ postfix: '.bla' });
        fs.writeFileSync(tmpFile.name, expectedData);

        const formData = new FormData();
        formData.append('qqfile', fs.createReadStream(tmpFile.name));
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userObj.token}`
            },
            body: formData
        });

        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'upload-error');
        t.is(json.message, 'File has an invalid extension, it should be one of txt, csv, tsv.');
    } finally {
        await destroy(chart, Object.values(userObj));
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test('PHP POST /charts/{id}/data returns an error if file with no extension is uploaded', async t => {
    let userObj = {};
    let chart;
    let tmpFile;
    const expectedData = 'test,data';
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:write', 'chart:read']
        });
        chart = await createChart({
            author_id: userObj.user.id
        });
        tmpFile = tmp.fileSync();
        fs.writeFileSync(tmpFile.name, expectedData);

        const formData = new FormData();
        formData.append('qqfile', fs.createReadStream(tmpFile.name));
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userObj.token}`
            },
            body: formData
        });

        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'upload-error');
        t.is(json.message, 'File has an invalid extension, it should be one of txt, csv, tsv.');
    } finally {
        await destroy(chart, Object.values(userObj));
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test('PHP POST /charts/{id}/data returns an error if empty file is uploaded', async t => {
    let userObj = {};
    let chart;
    let tmpFile;
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:write', 'chart:read']
        });
        chart = await createChart({
            author_id: userObj.user.id
        });
        tmpFile = tmp.fileSync({ postfix: '.csv' });
        const formData = new FormData();
        formData.append('qqfile', fs.createReadStream(tmpFile.name));
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userObj.token}`
            },
            body: formData
        });

        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'upload-error');
        t.is(json.message, 'File is empty');
    } finally {
        await destroy(chart, Object.values(userObj));
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test('PHP POST /charts/{id}/data returns an error if file is too big', async t => {
    let userObj = {};
    let chart;
    let tmpFile;
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:write', 'chart:read']
        });
        chart = await createChart({
            author_id: userObj.user.id
        });
        tmpFile = tmp.fileSync({ postfix: '.csv' });
        fs.writeSync(tmpFile.fd, '0,', 2 * 1024 * 1024);
        fs.closeSync(tmpFile.fd);
        const formData = new FormData();
        formData.append('qqfile', fs.createReadStream(tmpFile.name));
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userObj.token}`
            },
            body: formData
        });

        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'upload-error');
        t.is(json.message, 'File is too large');
    } finally {
        await destroy(chart, Object.values(userObj));
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test("PHP POST /charts/{id}/data returns an error if user does not have scope 'chart:write'", async t => {
    let userObj = {};
    let chart;
    let tmpFile;
    const expectedCsv = 'test,data';
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:read'] });
        chart = await createChart({
            author_id: userObj.user.id
        });
        tmpFile = tmp.fileSync({ postfix: '.csv' });
        fs.writeFileSync(tmpFile.name, expectedCsv);
        const formData = new FormData();
        formData.append('qqfile', fs.createReadStream(tmpFile.name));
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userObj.token}`
            },
            body: formData
        });
        t.is(res.status, 403);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(chart, Object.values(userObj));
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test('PHP POST /charts/{id}/data returns an error if user cannot access chart', async t => {
    let userObj = {};
    let team;
    let chart;
    let tmpFile;
    const expectedCsv = 'test,data';
    try {
        team = await createTeam();
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:read', 'chart:write']
        });
        chart = await createChart({
            organization_id: team.id
        });
        tmpFile = tmp.fileSync({ postfix: '.csv' });
        fs.writeFileSync(tmpFile.name, expectedCsv);
        const formData = new FormData();
        formData.append('qqfile', fs.createReadStream(tmpFile.name));
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userObj.token}`
            },
            body: formData
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(chart, team, Object.values(userObj));
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});

test('PHP POST /charts/{id}/data returns an error if chart does not exist', async t => {
    let userObj = {};
    let tmpFile;
    const expectedCsv = 'test,data';
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:write'] });
        tmpFile = tmp.fileSync({ postfix: '.csv' });
        fs.writeFileSync(tmpFile.name, expectedCsv);
        const formData = new FormData();
        formData.append('qqfile', fs.createReadStream(tmpFile.name));
        const res = await fetch(`${BASE_URL}/charts/00000/data`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userObj.token}`
            },
            body: formData
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'no-such-chart');
    } finally {
        await destroy(Object.values(userObj));
        if (tmpFile) {
            tmpFile.removeCallback();
        }
    }
});
