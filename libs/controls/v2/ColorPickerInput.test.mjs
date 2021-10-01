/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';
import chroma from 'chroma-js';

import ColorPickerInput from './ColorPickerInput.html';
import Chart from '@datawrapper/chart-core/lib/dw/svelteChart';

const themeData = {
    colors: {
        palette: [
            '#18a1cd',
            '#1d81a2',
            '#15607a',
            '#00dca6',
            '#09bb9f',
            '#009076',
            '#c4c4c4',
            '#c71e1d',
            '#fa8c00',
            '#ffca76',
            '#ffe59c'
        ],
        picker: {
            rowCount: 6
        }
    }
};

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);

    t.context.chart = new Chart();
    t.context.chart.set({ themeData });
});

test('Render color picker content on dropdown button click', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context
    });

    t.context.querySelector('.base-drop-btn').click();
    t.truthy(t.context.querySelector('.color-selector'));
    const { open } = picker.get();
    t.is(open, true);
});

test('Render default input as transparent / empty string', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context
    });

    const { color, color_, inputColor } = picker.get();
    t.is(color, false);
    t.is(color_, '#00000000');
    t.is(inputColor, '');
});

test('Update internal state variables on setting external color', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context
    });

    picker.set({ color: '#ff0000' });
    const { color_, inputColor } = picker.get();
    t.is(color_, '#ff0000');
    t.is(inputColor, '#ff0000');
});

test('Upon reset, set color to false and show as transparent / empty string', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context
    });

    picker.set({ reset: true, color: '#ff0000' });
    picker.resetColor();

    const { color, color_, inputColor } = picker.get();
    t.is(color, false);
    t.is(color_, '#00000000');
    t.is(inputColor, '');
});

test('Set color to hex code by clicking on swatch in palette selector', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context
    });

    t.context.querySelector('.base-drop-btn').click();

    const paletteSwatches = t.context.querySelectorAll('.palette .color');
    const firstSwatch = paletteSwatches[0];
    firstSwatch.click();

    const { color } = picker.get();
    t.is(color, '#18a1cd');
});

test('Set color to theme palette index by clicking on swatch in palette selector', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context,
        data: {
            returnPaletteIndex: true
        }
    });

    t.context.querySelector('.base-drop-btn').click();

    const paletteSwatches = t.context.querySelectorAll('.palette .color');
    const firstSwatch = paletteSwatches[0];
    firstSwatch.click();

    const { color } = picker.get();
    t.is(color, 0);
});

test('Update color through text input field', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context
    });

    t.context.querySelector('.base-drop-btn').click();

    $(t.context).find('.footer input').val('#ff0000').trigger('input');

    t.context.querySelector('button.ok').click();

    const { color } = picker.get();
    t.is(color, '#ff0000');
});

test('Normalize to hex code through text input field', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context
    });

    // set input to `#f00`
    t.context.querySelector('.base-drop-btn').click();

    $(t.context).find('.footer input').val('#f00').trigger('input');

    t.context.querySelector('button.ok').click();

    const { color: colorResult1, inputColor: inputColorResult1 } = picker.get();
    t.is(colorResult1, '#ff0000');
    t.is(inputColorResult1, '#ff0000');

    // set input to `red`
    t.context.querySelector('.base-drop-btn').click();

    $(t.context).find('.footer input').val('red').trigger('input');

    t.context.querySelector('button.ok').click();

    const { color: colorResult2, inputColor: inputColorResult2 } = picker.get();
    t.is(colorResult2, '#ff0000');
    t.is(inputColorResult2, '#ff0000');
});

test('Entering invalid value does not set color', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context
    });

    // first set color to something meaningful: `#ff0000`
    t.context.querySelector('.base-drop-btn').click();

    $(t.context).find('.footer input').val('#ff0000').trigger('input');

    t.context.querySelector('button.ok').click();

    // then try to set it to an invalid value: `garbage`
    t.context.querySelector('.base-drop-btn').click();

    $(t.context).find('.footer input').val('garbage').trigger('input');

    t.context.querySelector('button.ok').click();

    const { color, lastValidInputColor } = picker.get();

    // color is still `#ff0000`
    t.is(color, '#ff0000');

    // we're still showing last valid input color for input background
    t.is(lastValidInputColor, '#ff0000');
    t.is(chroma(picker.refs.input.style.background).hex(), '#ff0000');
});

test('Previous color button tracks color that is set when picker is opened', t => {
    const picker = new ColorPickerInput({
        store: t.context.chart,
        target: t.context
    });

    // set color & open picker: previous color is set
    picker.set({ color: '#ff0000' });
    t.context.querySelector('.base-drop-btn').click();
    const { previousColor } = picker.get();
    t.is(previousColor, '#ff0000');

    // select new color: previous color still set to the original one
    const paletteSwatches = t.context.querySelectorAll('.palette .color');
    const firstSwatch = paletteSwatches[0];
    firstSwatch.click();
    const { color: colorResult1 } = picker.get();
    t.is(colorResult1, '#18a1cd');
    t.is(previousColor, '#ff0000');

    // reset to previous color
    t.context.querySelector('.previous').click();
    const { color: colorResult2 } = picker.get();
    t.is(colorResult2, '#ff0000');
});
