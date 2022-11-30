const test = require('ava');
const OpenSearchClient = require('../../utils/openSearchClient.js');
const { requireConfig } = require('@datawrapper/backend-utils');
const { genRandomChartId } = require('../../../test/helpers/setup');

const config = requireConfig();

test.before(async t => {
    t.context.openSearchClient = new OpenSearchClient(config.opensearch);
});

test('OpenSearch rejects documents with unknown fields', async t => {
    const charts = [
        {
            id: genRandomChartId(),
            spam: 'spam'
        }
    ];
    try {
        const res = await t.context.openSearchClient.index(charts);
        t.true(res.errors);
    } finally {
        // Clean up in case the test failed and a document was actually created.
        await t.context.openSearchClient.delete(charts);
    }
});
