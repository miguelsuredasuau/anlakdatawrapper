/* eslint no-new: 0 */

import test from 'ava';
import ListInput from './ListInput.html';
import { clickEvent } from './test/helpers/utils.mjs';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

const items = ['Alice', 'Bob', 'Carol', 'David'].map(name => {
    return {
        id: name.toLowerCase(),
        name
    };
});

items.push(
    {
        id: 'eve',
        label: 'Eve'
    },
    { id: 'frank' }
);

test('Render single ul and one li per item', t => {
    new ListInput({
        target: t.context,
        data: { items }
    });
    t.is(t.context.querySelectorAll('ul').length, 1);
    t.is(t.context.querySelectorAll('ul li').length, items.length);
});

test('Default ListItem is <div>{name || label || id}</div>', t => {
    new ListInput({
        target: t.context,
        data: { items }
    });
    t.is(t.context.querySelector('ul li:first-child').innerHTML.trim(), '<div>Alice</div>');
    t.is(t.context.querySelector('ul li:nth-last-child(2)').innerHTML.trim(), '<div>Eve</div>');
    t.is(t.context.querySelector('ul li:last-child').innerHTML.trim(), '<div>frank</div>');
});

test('Pre-selected items', t => {
    new ListInput({
        target: t.context,
        data: { items, selected: ['alice', 'frank'] }
    });
    t.true(t.context.querySelector('li:first-child').classList.contains('selected'));
    t.false(t.context.querySelector('li + li').classList.contains('selected'));
    t.true(t.context.querySelector('li:last-child').classList.contains('selected'));
});

test('Clicking selects items', t => {
    const list = new ListInput({
        target: t.context,
        data: { items }
    });

    t.deepEqual(list.get().selected, []);
    t.false(t.context.querySelector('li:first-child').classList.contains('selected'));

    // click alice
    t.context.querySelector('li:first-child').click();

    t.deepEqual(list.get().selected, ['alice']);
    t.true(t.context.querySelector('li:first-child').classList.contains('selected'));
});

test('Clicking in unselectable Lists does not select items', t => {
    const list = new ListInput({
        target: t.context,
        data: { items, selectable: false }
    });

    t.deepEqual(list.get().selected, []);
    t.false(t.context.querySelector('li:first-child').classList.contains('selected'));

    // click alice
    t.context.querySelector('li:first-child').click();

    t.deepEqual(list.get().selected, []);
    t.false(t.context.querySelector('li:first-child').classList.contains('selected'));
});

test('Clicking second item unselects ﬁrst item', t => {
    const list = new ListInput({
        target: t.context,
        data: { items, selected: ['alice'] }
    });

    t.deepEqual(list.get().selected, ['alice']);
    t.true(t.context.querySelector('li:first-child').classList.contains('selected'));

    // click bob
    t.context.querySelector('li + li').click();

    t.deepEqual(list.get().selected, ['bob']);
    t.false(t.context.querySelector('li:first-child').classList.contains('selected'));
    t.true(t.context.querySelector('li + li').classList.contains('selected'));
});

test('Ctrl-clicking another item selects both item', t => {
    const list = new ListInput({
        target: t.context,
        data: { items, selected: ['alice'] }
    });

    t.deepEqual(list.get().selected, ['alice']);
    t.true(t.context.querySelector('li:first-child').classList.contains('selected'));

    // ctrl-click bob
    clickEvent(t.context.querySelector('li + li'), { ctrl: true });

    t.deepEqual(list.get().selected, ['alice', 'bob']);
    t.true(t.context.querySelector('li:first-child').classList.contains('selected'));
    t.true(t.context.querySelector('li + li').classList.contains('selected'));
});

test('Meta-clicking another item selects both item', t => {
    const list = new ListInput({
        target: t.context,
        data: { items, selected: ['alice'] }
    });

    // meta-click bob
    clickEvent(t.context.querySelector('li + li'), { meta: true });
    t.deepEqual(list.get().selected, ['alice', 'bob']);
});

test('Ctrl-clicking second item unselects ﬁrst item if not multiselectable', t => {
    const list = new ListInput({
        target: t.context,
        data: { items, selected: ['alice'], multiselectable: false }
    });

    t.deepEqual(list.get().selected, ['alice']);
    t.true(t.context.querySelector('li:first-child').classList.contains('selected'));

    // select alice
    clickEvent(t.context.querySelector('li + li'), { ctrl: true });

    t.deepEqual(list.get().selected, ['bob']);
    t.false(t.context.querySelector('li:first-child').classList.contains('selected'));
    t.true(t.context.querySelector('li + li').classList.contains('selected'));
});

test('Shift-clicking selects range', t => {
    const list = new ListInput({
        target: t.context,
        data: { items, selected: ['alice'] }
    });

    // shift-click carol
    clickEvent(t.context.querySelector('li + li + li'), { shift: true });

    t.deepEqual(list.get().selected, ['alice', 'bob', 'carol']);
});

test('Shift-clicking again extends range down', t => {
    const list = new ListInput({
        target: t.context,
        data: { items, selected: ['carol', 'david'] }
    });

    // shift-click eve
    clickEvent(t.context.querySelector('li:nth-child(5)'), { shift: true });
    t.deepEqual(list.get().selected, ['carol', 'david', 'eve']);
});

test('Shift-clicking again extends range up', t => {
    const list = new ListInput({
        target: t.context,
        data: { items, selected: ['carol', 'david'] }
    });

    // shift-click eve
    clickEvent(t.context.querySelector('li:first-child'), { shift: true });
    t.deepEqual(list.get().selected, ['alice', 'bob', 'carol', 'david']);
});

test('Ctrl-clicking again extends existing multiselection', t => {
    const list = new ListInput({
        target: t.context,
        data: { items, selected: ['carol', 'david'] }
    });

    // shift-click eve
    clickEvent(t.context.querySelector('li:first-child'), { ctrl: true });
    t.deepEqual(list.get().selected, ['carol', 'david', 'alice']);
});
