const test = require('ava');
const fs = require('fs-extra');
const { nanoid } = require('nanoid');
const path = require('path');
const os = require('os');
const utils = require('./index.js');
const isEmpty = require('lodash/isEmpty');

test.before(async t => {
    const directory = path.join(os.tmpdir(), 'dw.api.test');
    await fs.mkdir(directory);

    Object.assign(t.context, { directory });
});

test.after.always(async t => {
    await fs.remove(t.context.directory);
});

test('stringify escapes <script> and <style> tags', t => {
    const result = utils.stringify({
        test: '<script>alert("test")</script><style>body {}</style>'
    });

    t.true(result.includes('<\\/script>'));
    t.true(result.includes('<\\/style>'));
});

test('copyFileHashed should copy a file with hashed filename', async t => {
    const directory = path.join(t.context.directory, nanoid());
    const data = 'TEST';
    const dataHash = '94ee0593';

    await fs.mkdir(directory);
    await fs.writeFile(path.join(directory, 'test.txt'), data, { encoding: 'utf-8' });

    const filename = await utils.copyFileHashed(path.join(directory, 'test.txt'), directory, {
        prefix: 'foo'
    });
    const hash = filename.split('.').slice(-2, -1)[0];
    t.is(hash, dataHash);

    const content = await fs.readFile(path.join(directory, filename), { encoding: 'utf-8' });
    t.is(content, data);
});

test('readFileAndHash should create a filename with hash based on content', async t => {
    const directory = path.join(t.context.directory, nanoid());
    const data = 'TEST';
    const dataHash = '94ee0593';

    await fs.mkdir(directory);
    await fs.writeFile(path.join(directory, 'test.txt'), data, { encoding: 'utf-8' });

    const { content, fileName } = await utils.readFileAndHash(path.join(directory, 'test.txt'));
    t.is(content, data);
    t.is(fileName, `test.${dataHash}.txt`);
});

test('camelizeTopLevelKeys camelizes only top level keys in nested object', t => {
    const obj = {
        author_id: 1,
        'key name': 'property text',
        custom_fields: {
            'Chart ID': '1234',
            'hidden from public': true
        }
    };

    const camelizedObj = utils.camelizeTopLevelKeys(obj);

    t.true('authorId' in camelizedObj);
    t.false('author_id' in camelizedObj);
    t.true('keyName' in camelizedObj);
    t.false('key name' in camelizedObj);
    t.true('customFields' in camelizedObj);
    t.false('custom_fields' in camelizedObj);

    t.true('Chart ID' in camelizedObj.customFields);
    t.false('chartID' in camelizedObj.customFields);
    t.true('hidden from public' in camelizedObj.customFields);
    t.false('hiddenFromPublic' in camelizedObj.customFields);
});

test('camelizeTopLevelKeys does not crash on empty object', t => {
    const obj = {};
    const camelizedObj = utils.camelizeTopLevelKeys(obj);
    t.true(isEmpty(camelizedObj));
});

test('isValidMySQLJSON returns true for a valid JSON', t => {
    t.true(
        utils.isValidMySQLJSON({
            null: null,
            boolean: true,
            number: 1,
            string: 'a',
            object: {
                0: 'number',
                string: 'a',
                nested: {
                    string: 'a'
                }
            },
            arrays: {
                empty: [],
                numbers: [1, 2],
                strings: ['a', 'b'],
                objects: [{ string: 'a' }, { string: 'a' }]
            }
        })
    );
});

test('isValidMySQLJSON returns false for a JSON with too large object key', t => {
    t.false(utils.isValidMySQLJSON({ ['a'.repeat(2 ** 16)]: 'value' }));
    t.false(
        utils.isValidMySQLJSON({
            nested: { ['a'.repeat(2 ** 16)]: 'value' }
        })
    );
    t.false(
        utils.isValidMySQLJSON({
            array: [{ ['a'.repeat(2 ** 16)]: 'value' }]
        })
    );
});

test('isValidMySQLJSON returns false for a JSON with an invalid UTF-16 string', t => {
    // This testing string is invalid UTF-16, because it misses the tail surrogate.
    // See https://mnaoumov.wordpress.com/2014/06/14/stripping-invalid-characters-from-utf-16-strings/
    t.false(utils.isValidMySQLJSON('\ud800b'));
    t.false(
        utils.isValidMySQLJSON({
            nested: '\ud800b'
        })
    );
    t.false(
        utils.isValidMySQLJSON({
            array: ['\ud800b']
        })
    );
});
