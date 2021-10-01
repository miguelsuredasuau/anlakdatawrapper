/* eslint-disable no-new */

import CheckboxControl from './CheckboxControl.svelte';
import test from 'ava';

test('Render label with provided text', t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    new CheckboxControl({
        target,
        props: { label: 'Some text' }
    });

    t.is(target.querySelector('label').textContent.trim(), 'Some text');
});

test('Render unchecked input by default', t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    new CheckboxControl({
        target
    });

    t.false(target.querySelector('input[type=checkbox]').checked);
});

test('Render checked input', t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    new CheckboxControl({
        target,
        props: { value: true }
    });

    t.true(target.querySelector('input[type=checkbox]').checked);
});

test('Render unchecked input', t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    new CheckboxControl({
        target,
        props: { value: false }
    });

    t.false(target.querySelector('input[type=checkbox]').checked);
});

test('Render disabled input', t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    new CheckboxControl({
        target,
        props: { disabled: true }
    });

    t.true(target.querySelector('input[type=checkbox]').disabled);
    t.true(target.querySelector('label').classList.contains('disabled'));
});

test('Render "faded" input', t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    new CheckboxControl({
        target,
        props: { faded: true }
    });

    t.true(target.querySelector('label').classList.contains('faded'));
});

test('Can be checked', async t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    const checkbox = new CheckboxControl({
        target
    });

    target.querySelector('input[type=checkbox]').click();
    t.true(checkbox.value);
});

test('Can be toggled', t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    const checkbox = new CheckboxControl({
        target
    });

    target.querySelector('input[type=checkbox]').click();
    t.true(checkbox.value);
    target.querySelector('input[type=checkbox]').click();
    t.false(checkbox.value);
    target.querySelector('input[type=checkbox]').click();
    t.true(checkbox.value);
});

test('default checkbox has no uid', t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    new CheckboxControl({
        target
    });

    t.is(target.querySelector('.control-group').getAttribute('data-uid'), null);
});

test('checkbox can have data-uid', t => {
    const target = document.createElement('form');
    document.body.appendChild(target);
    new CheckboxControl({
        target,
        props: { uid: 'foobar' }
    });

    t.is(target.querySelector('.control-group').getAttribute('data-uid'), 'foobar');
});
