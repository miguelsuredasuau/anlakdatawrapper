import translate from './translate.mjs';

describe('translate', function () {
    it('picks a translation string from a provided message object', function () {
        const messages = { core: { foo: 'Fooo', bar: 'Baar' } };
        const __ = key => translate(key, 'core', messages);
        expect(__('foo')).to.equal('Fooo');
        expect(__('bar')).to.equal('Baar');
    });

    it('falls back to key if no translation is available', function () {
        const messages = { core: { foo: 'Fooo', bar: 'Baar' } };
        const __ = key => translate(key, 'core', messages);
        expect(__('baz')).to.equal('baz');
    });

    it('replaces placeholders with provided values', function () {
        const messages = { core: { 'my-key': '%a %a% %ab %ab% %abc %abc%' } };
        const __ = (key, scope, replacement) => translate(key, scope, messages, replacement);
        expect(__('my-key', 'core', { a: 'foo' })).to.equal('foo foo %ab %ab% %abc %abc%');
        expect(__('my-key', 'core', { ab: 'foo' })).to.equal('%a %a% foo foo %abc %abc%');
        expect(__('my-key', 'core', { abc: 'foo' })).to.equal('%a %a% %ab %ab% foo foo');
    });

    it('sanitizes potentially malicious HTML', function () {
        const messages = { core: { 'my-key': 'Hello %user_name%!' } };
        const data = { user_name: '<a href="#" onclick="alert(this)">World</a>' };
        const __ = (key, scope, replacement) => translate(key, scope, messages, replacement);
        expect(__('my-key', 'core', data)).to.equal(
            'Hello <a href="#" target="_blank" rel="nofollow noopener noreferrer">World</a>!'
        );
    });
});
