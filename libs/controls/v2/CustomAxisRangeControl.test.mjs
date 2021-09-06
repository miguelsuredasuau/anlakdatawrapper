/* eslint no-new: 0 */

import test from 'ava';
import CustomAxisRangeControl from './CustomAxisRangeControl.html';

test.beforeEach(t => {
    t.context = document.createElement('form');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('By default, CustomAxisRangeControl consists of two empty number input elements', t => {
    new CustomAxisRangeControl({
        target: t.context
    });

    const inputs = t.context.querySelectorAll('input[type=text]');

    t.is(inputs.length, 2);
    t.is(inputs[0].value, '');
    t.is(inputs[1].value, '');
});

test('Render provided values in inputs', t => {
    new CustomAxisRangeControl({
        target: t.context,
        data: { value: [23, 42] }
    });

    const inputs = t.context.querySelectorAll('input[type=text]');

    t.is(inputs[0].value, '23');
    t.is(inputs[1].value, '42');
});

test('Provide input values as strings through a values property', t => {
    const range = new CustomAxisRangeControl({
        target: t.context,
        data: { value: [23, 42] }
    });

    const inputs = t.context.querySelectorAll('input[type=text]');
    const inputEvent = document.createEvent('Event');
    inputEvent.initEvent('input', true, true);

    inputs[0].value = 3;
    inputs[0].dispatchEvent(inputEvent);
    inputs[1].value = 4;
    inputs[1].dispatchEvent(inputEvent);

    t.is(range.get().value[0], '3');
    t.is(range.get().value[1], '4');
});
