/* eslint no-new: 0 */

import test from 'ava';
import NumberInput from './NumberInput.html';
import $ from 'cash-dom';

test.beforeEach(t => {
    t.context = $('<div />');
    $(document.body)
        .empty()
        .append(t.context);
});

test('Render number input with slider by default', t => {
    new NumberInput({
        target: t.context[0]
    });

    t.truthy(t.context.find('input[type=range]'));
    t.truthy(t.context.find('input[type=number]'));
});

test('Render number input without slider', t => {
    new NumberInput({
        target: t.context[0],
        data: { slider: false }
    });

    t.is(t.context.find('input[type=range]').length, 0);
    t.is(t.context.find('input[type=number]').length, 1);
});

test('Render number input with unit', t => {
    new NumberInput({
        target: t.context[0],
        data: { unit: 'px' }
    });

    t.is(t.context.find('span.unit').length, 1);
    t.is(t.context.find('span.unit').html(), 'px');
});

test('Render number input button with initial value', t => {
    new NumberInput({
        target: t.context[0],
        data: { value: 42 }
    });

    t.is(t.context.find('input[type=range]').val(), '42');
    t.is(t.context.find('input[type=number]').val(), '42');
});

test('Updating the value programatically', t => {
    const app = new NumberInput({
        target: t.context[0],
        data: { value: 0 }
    });

    app.set({ value: 42 });

    t.is(t.context.find('input[type=range]').val(), '42');
    t.is(t.context.find('input[type=number]').val(), '42');
});

test('Updating the value via the input controls', t => {
    const app = new NumberInput({
        target: t.context[0],
        data: { value: 0 }
    });

    // Set value via the number input and fire input event to trigger data binding
    t.context
        .find('input[type=number]')
        .val(42)
        .trigger('input');

    t.is(app.get().value, 42);

    // Set value via the range input and fire input event to trigger data binding
    t.context
        .find('input[type=range]')
        .val(23)
        .trigger('input');

    t.is(app.get().value, 23);
});

test('Updating the value via the input controls to 0', t => {
    const app = new NumberInput({
        target: t.context[0]
    });

    // Set value via the number input and fire input event to trigger data binding
    t.context
        .find('input[type=number]')
        .val(0)
        .trigger('input');

    t.is(app.get().value, 0);

    // Set value via the range input and fire input event to trigger data binding
    t.context
        .find('input[type=range]')
        .val(0)
        .trigger('input');

    t.is(app.get().value, 0);
});
