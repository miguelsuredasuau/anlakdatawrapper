/* eslint-disable no-new */

import test from 'ava';
import { tick } from 'svelte';
import DropdownInput from './DropdownInput.svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test.serial('Render dropdown button, but no content', t => {
    new DropdownInput({
        target: t.context
    });

    t.truthy(t.context.querySelector('.dropdown-input-btn'));
    t.falsy(t.context.querySelector('.dropdown-input-inner'));
});

test.serial('Render dropdown content if visible initialy', t => {
    new DropdownInput({
        target: t.context,
        props: { visible: true }
    });

    t.truthy(t.context.querySelector('.dropdown-input-inner'));
});

test.serial('Reveal dropdown content on button click', async t => {
    new DropdownInput({
        target: t.context
    });

    t.falsy(t.context.querySelector('.dropdown-input-inner'));
    t.context.querySelector('.dropdown-input-btn').click();
    await tick();
    t.truthy(t.context.querySelector('.dropdown-input-inner'));
});

test.serial('Hide dropdown content on button click', async t => {
    new DropdownInput({
        target: t.context,
        props: { visible: true }
    });

    t.truthy(t.context.querySelector('.dropdown-input-inner'));
    t.context.querySelector('.dropdown-input-btn').click();
    await tick();
    t.falsy(t.context.querySelector('.dropdown-input-inner'));
});

test.serial('Hide dropdown content on window click', async t => {
    new DropdownInput({
        target: t.context,
        props: { visible: true }
    });

    t.truthy(t.context.querySelector('.dropdown-input-inner'));
    document.body.click();
    await tick();
    t.falsy(t.context.querySelector('.dropdown-input-inner'));
});

test.serial('Dont reveal dropdown content on window click', t => {
    new DropdownInput({
        target: t.context
    });

    t.falsy(t.context.querySelector('.dropdown-input-inner'));
    document.body.click();
    t.falsy(t.context.querySelector('.dropdown-input-inner'));
});

test.serial('default dropdown has no uid', t => {
    new DropdownInput({
        target: t.context
    });

    t.is(t.context.querySelector('.dropdown-input-wrap').getAttribute('data-uid'), null);
});

test.serial('dropdown can have data-uid', t => {
    new DropdownInput({
        target: t.context,
        props: { uid: 'foobar' }
    });

    t.is(t.context.querySelector('.dropdown-input-wrap').getAttribute('data-uid'), 'foobar');
});
