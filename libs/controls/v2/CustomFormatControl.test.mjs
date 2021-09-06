/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';
import { Store } from 'svelte/store.umd.js';

import CustomFormatControl from './CustomFormatControl.html';

const store = new Store({ vis: null, axis: null });

test.beforeEach(t => {
    t.context = $('<form />');
    $(document.body)
        .empty()
        .append(t.context);
});

test('Render a select element', t => {
    new CustomFormatControl({
        target: t.context[0],
        store
    });

    // Check if select element is present
    t.is(t.context.find('select').length, 1);
});

test('Preselect a provided option', t => {
    new CustomFormatControl({
        target: t.context[0],
        data: { value: '0.00%' },
        store
    });

    // Check if provided value is selected
    t.is(t.context.find('select').val(), '0.00%');
});

test("Render date formats when type is set to 'date'", t => {
    new CustomFormatControl({
        target: t.context[0],
        data: { type: 'date' },
        store
    });

    // Check if default date format is selected
    t.is(t.context.find('select').val(), 'YYYY');
});

test('Update value when option is selected', t => {
    const customFormat = new CustomFormatControl({
        target: t.context[0],
        store
    });

    // Select option and trigger change event:
    t.context
        .find('select')
        .val('0.00%')
        .trigger('change');

    // Check if selected option is shown
    t.is(customFormat.get().selected, '0.00%');
});

test("Show text input when 'custom' is selected", t => {
    new CustomFormatControl({
        target: t.context[0],
        store
    });

    // Select option and trigger change event:
    t.context
        .find('select')
        .val('custom')
        .trigger('change');

    // Check if text input element is present
    t.is(t.context.find('input[type=text]').length, 1);
});

test('Show custom format string in text input', t => {
    new CustomFormatControl({
        target: t.context[0],
        data: { value: '0000000000.00' },
        store
    });

    // Check if provided format string is shown
    t.is(t.context.find('input[type=text]').val(), '0000000000.00');
});

test("Add and select an 'auto' option", t => {
    new CustomFormatControl({
        target: t.context[0],
        data: { value: 'auto', auto: true },
        store
    });

    // Check if 'auto' value is selected
    t.is(t.context.find('select').val(), 'auto');
});

test('When disabled, select element is disabled', t => {
    new CustomFormatControl({
        target: t.context[0],
        data: { disabled: true },
        store
    });

    // Check if select element is disabled
    t.is(t.context.find('select')[0].disabled, true);
});

test('When disabled, show the disabled message', t => {
    new CustomFormatControl({
        target: t.context[0],
        data: { disabled: true, disabledMessage: 'explain why this is disabled' },
        store
    });

    // Check if disabled message is displayed
    t.is(t.context.find('.message').text(), 'explain why this is disabled');
});

test('When disabled, disabled message takes precedence over custom format message', t => {
    new CustomFormatControl({
        target: t.context[0],
        data: { disabled: true, value: 'some custom format XXX', disabledMessage: 'explain why this is disabled' },
        store
    });

    // Check if disabled message is displayed
    t.is(t.context.find('.message').text(), 'explain why this is disabled');
});

test('When enabled, show the custom format message (not disabled message)', t => {
    new CustomFormatControl({
        target: t.context[0],
        data: { disabled: false, value: 'some custom format XXX', disabledMessage: 'explain why this is disabled' },
        store
    });

    // Check if custom format message is displayed
    t.is(t.context.find('.message').text(), 'For help on custom formats, check our documentation.');
});
