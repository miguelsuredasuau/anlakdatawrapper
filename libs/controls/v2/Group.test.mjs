/* eslint no-new: 0 */

import test from 'ava';
import Group from './Group.html';

test.beforeEach(t => {
    t.context = document.createElement('form');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('Default group is open', t => {
    new Group({
        target: t.context
    });
    t.truthy(t.context.querySelector('.option-group-content'));
    t.is(t.context.querySelector('.option-group-content').textContent.trim(), 'content');
});

test('Group label with HTML', t => {
    new Group({
        target: t.context,
        data: { label: 'Some <b>bold</b> text' }
    });
    t.is(t.context.querySelector('label.group-title').textContent.trim(), 'Some bold text');
    t.is(t.context.querySelector('label.group-title b').textContent.trim(), 'bold');
});
