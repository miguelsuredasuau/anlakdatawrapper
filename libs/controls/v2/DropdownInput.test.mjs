/* eslint no-new: 0 */

import test from 'ava';
import DropdownInput from './DropdownInput.html';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('Render dropdown button, but no content', t => {
    new DropdownInput({
        target: t.context
    });

    t.truthy(t.context.querySelector('.base-drop-btn'));
    t.falsy(t.context.querySelector('.base-dropdown-inner'));
});

test('Render dropdown content if visible initialy', t => {
    new DropdownInput({
        target: t.context,
        data: { visible: true }
    });

    t.truthy(t.context.querySelector('.base-dropdown-inner'));
});

test('Reveal dropdown content on button click', t => {
    new DropdownInput({
        target: t.context
    });

    t.falsy(t.context.querySelector('.base-dropdown-inner'));
    t.context.querySelector('.base-drop-btn').click();
    t.truthy(t.context.querySelector('.base-dropdown-inner'));
});

test('Hide dropdown content on button click', t => {
    new DropdownInput({
        target: t.context,
        data: { visible: true }
    });

    t.truthy(t.context.querySelector('.base-dropdown-inner'));
    t.context.querySelector('.base-drop-btn').click();
    t.falsy(t.context.querySelector('.base-dropdown-inner'));
});

test('Hide dropdown content on window click', t => {
    new DropdownInput({
        target: t.context,
        data: { visible: true }
    });

    t.truthy(t.context.querySelector('.base-dropdown-inner'));
    document.body.click();
    t.falsy(t.context.querySelector('.base-dropdown-inner'));
});

test('Dont reveal dropdown content on window click', t => {
    new DropdownInput({
        target: t.context,
        data: { visible: false }
    });

    t.falsy(t.context.querySelector('.base-dropdown-inner'));
    document.body.click();
    t.falsy(t.context.querySelector('.base-dropdown-inner'));
});
