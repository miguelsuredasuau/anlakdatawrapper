/* eslint-disable no-new */

import NumberInput from './NumberInput.svelte';
import test from 'ava';
import { tick } from 'svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('Render number input with slider by default', t => {
    new NumberInput({
        target: t.context
    });

    t.truthy(t.context.querySelector('input[type=range]'));
    t.truthy(t.context.querySelector('input[type=number]'));
});

test('Render number input without slider', t => {
    new NumberInput({
        target: t.context,
        props: { slider: false }
    });

    t.falsy(t.context.querySelector('input[type=range]'));
    t.truthy(t.context.querySelector('input[type=number]'));
});

test('Render number input with unit', t => {
    new NumberInput({
        target: t.context,
        props: { unit: 'px' }
    });

    t.truthy(t.context.querySelector('span.unit'));
    t.is(t.context.querySelector('span.unit').textContent, 'px');
});

test('Render number input button with initial value', t => {
    new NumberInput({
        target: t.context,
        props: { value: 42 }
    });

    t.is(t.context.querySelector('input[type=range]').value, '42');
    t.is(t.context.querySelector('input[type=number]').value, '42');
});

test('Updating the value programatically', t => {
    const app = new NumberInput({
        target: t.context,
        props: { value: 0 }
    });

    app.value = 42;

    t.is(t.context.querySelector('input[type=range]').value, '42');
    t.is(t.context.querySelector('input[type=number]').value, '42');
});

test('NumberInput rounds value to a number of decimals calculated from the step size', async t => {
    const app = new NumberInput({
        target: t.context,
        props: { value: 0, step: 0.1 }
    });

    app.value = 42.567;

    t.is(t.context.querySelector('input[type=range]').value, '42.6');
    t.is(t.context.querySelector('input[type=number]').value, '42.6');

    // Update value via number input.
    t.context.querySelector('input[type=number]').value = 23.456;
    t.context.querySelector('input[type=number]').dispatchEvent(new Event('input'));
    await tick();

    t.is(app.value, 23.5);
});

test('NumberInput rounds value to a specified number of decimals', async t => {
    const app = new NumberInput({
        target: t.context,
        props: { value: 0, step: 0.1, decimals: 2 }
    });

    app.value = 42.567;

    t.is(t.context.querySelector('input[type=range]').value, '42.57');
    t.is(t.context.querySelector('input[type=number]').value, '42.57');

    // Update value via number input.
    t.context.querySelector('input[type=number]').value = 23.456;
    t.context.querySelector('input[type=number]').dispatchEvent(new Event('input'));
    await tick();

    t.is(app.value, 23.46);
});

test('Updating the value via the input controls', async t => {
    const app = new NumberInput({
        target: t.context,
        props: { value: 0 }
    });

    // Set value via the number input and fire input event to trigger data binding
    t.context.querySelector('input[type=number]').value = 42;
    t.context.querySelector('input[type=number]').dispatchEvent(new Event('input'));
    await tick();

    t.is(app.value, 42);

    // Set value via the range input and fire input event to trigger data binding
    t.context.querySelector('input[type=range]').value = 23;
    t.context.querySelector('input[type=range]').dispatchEvent(new Event('input'));
    await tick();

    t.is(app.value, 23);
});

test('Updating the value via the input controls to 0', async t => {
    const app = new NumberInput({
        target: t.context
    });

    // Set value via the number input and fire input event to trigger data binding
    t.context.querySelector('input[type=number]').value = 0;
    t.context.querySelector('input[type=number]').dispatchEvent(new Event('input'));
    await tick();

    t.is(app.value, 0);

    // Set value via the range input and fire input event to trigger data binding
    t.context.querySelector('input[type=range]').value = 0;
    t.context.querySelector('input[type=range]').dispatchEvent(new Event('input'));
    await tick();

    t.is(app.value, 0);
});

test('default NumberInput has no uid', t => {
    new NumberInput({
        target: t.context
    });

    t.is(t.context.querySelector('.number-control').getAttribute('data-uid'), null);
});

test('NumberInput can have data-uid', t => {
    new NumberInput({
        target: t.context,
        props: { uid: 'foobar' }
    });

    t.is(t.context.querySelector('.number-control').getAttribute('data-uid'), 'foobar');
});
