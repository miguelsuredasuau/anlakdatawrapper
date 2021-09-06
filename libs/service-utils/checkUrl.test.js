import test from 'ava';
import checkUrl from './checkUrl';

test('normal URLs work fine', t => {
    t.true(checkUrl('https://www.datawrapper.de'));
    t.true(checkUrl('http://app.datawrapper.local'));
    t.true(checkUrl('mailto://support@datawrapper.de'));
    t.true(checkUrl('ftp://example.com'));
});

test('unix URLs are rejected', t => {
    t.false(checkUrl('unix://foo'));
    t.false(checkUrl('foo://unix:foo'));
});
