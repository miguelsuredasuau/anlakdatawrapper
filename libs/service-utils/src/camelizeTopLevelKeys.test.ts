import test from 'ava';
import camelizeTopLevelKeys from './camelizeTopLevelKeys';
import isEmpty from 'lodash/isEmpty';

test('camelizeTopLevelKeys camelizes only top level keys in nested object', t => {
    const obj = {
        author_id: 1,
        'key name': 'property text',
        custom_fields: {
            'Chart ID': '1234',
            'hidden from public': true
        }
    };

    const camelizedObj = camelizeTopLevelKeys(obj) as {
        [key: string]: unknown;
        customFields: Record<string, unknown>;
    };

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
    const camelizedObj = camelizeTopLevelKeys(obj);
    t.true(isEmpty(camelizedObj));
});
