/* eslint-disable no-new */
import test from 'ava';
import { tick } from 'svelte';
import MoreOptionsGroup from './MoreOptionsGroup.svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('Default MoreOptionsGroup state', async t => {
    new MoreOptionsGroup({
        target: t.context
    });

    const button = t.context.querySelector('.more-options-toggle button');
    t.truthy(button);
    // content is not added to DOM
    t.falsy(t.context.querySelector('.more-options-content'));
    // hr not added to DOM
    t.falsy(t.context.querySelector('hr'));
    // clicking button should show content
    button.click();
    await tick();
    t.truthy(t.context.querySelector('.more-options-content'));
    t.falsy(t.context.querySelector('hr'));
    // clicking button again should hide content
    button.click();
    await tick();
    t.falsy(t.context.querySelector('.more-options-content'));
});

test('MoreOptionsGroup with bottomLine', async t => {
    new MoreOptionsGroup({
        target: t.context,
        props: {
            bottomLine: true
        }
    });

    t.falsy(t.context.querySelector('hr'));
    const button = t.context.querySelector('.more-options-toggle button');
    button.click();
    await tick();
    // hr now added to DOM
    t.truthy(t.context.querySelector('hr'));
});

test('MoreOptionsGroup with custom labels', async t => {
    new MoreOptionsGroup({
        target: t.context,
        props: {
            showLabel: 'show me',
            hideLabel: 'hide me'
        }
    });

    const button = t.context.querySelector('.more-options-toggle button');
    t.is(button.textContent.trim(), 'show me');
    button.click();
    await tick();
    // hr now added to DOM
    t.is(button.textContent.trim(), 'hide me');
});

test('Disabled MoreOptionsGroup', async t => {
    new MoreOptionsGroup({
        target: t.context,
        props: {
            disabled: true
        }
    });

    const button = t.context.querySelector('.more-options-toggle button');
    t.truthy(button);
    // content is not added to DOM
    t.falsy(t.context.querySelector('.more-options-content'));
    // clicking button should do nothing
    button.click();
    await tick();
    t.falsy(t.context.querySelector('.more-options-content'));
});

test('default MoreOptionsGroup has no uid', t => {
    new MoreOptionsGroup({
        target: t.context
    });

    t.is(t.context.querySelector('.control-group').getAttribute('data-uid'), null);
});

test('MoreOptionsGroup can have data-uid', t => {
    new MoreOptionsGroup({
        target: t.context,
        props: { uid: 'foobar' }
    });

    t.is(t.context.querySelector('.control-group').getAttribute('data-uid'), 'foobar');
});
