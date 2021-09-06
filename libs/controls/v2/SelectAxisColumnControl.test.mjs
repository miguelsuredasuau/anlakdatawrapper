/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';

import SelectAxisColumnControl from './SelectAxisColumnControl.html';
import Dataset from '@datawrapper/chart-core/lib/dw/dataset';
import Column from '@datawrapper/chart-core/lib/dw/dataset/column';
import Chart from '@datawrapper/chart-core/lib/dw/svelteChart';

const dataset = Dataset([
    Column('titles', ['foo', 'bar', 'baz'], 'text'),
    Column('categories', ['Cat. A', 'Cat. B', 'Cat. C'], 'text'),
    Column('values', [4, 5, 6], 'number'),
    Column('more values', [4, 5, 6], 'number'),
    Column('dates', ['2018', '2017', '2016'], 'date')
]);

const axes = {
    category: {
        accepts: ['text'],
        optional: false
    },
    color: {
        accepts: ['text'],
        optional: true
    },
    group: {
        accepts: ['text'],
        optional: true,
        'na-label': '(no selection)'
    },
    x: {
        accepts: ['number'],
        optional: true
    },
    y: {
        accepts: ['number', 'date'],
        optional: false
    }
};

test.beforeEach(t => {
    t.context.target = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context.target);

    t.context.chart = new Chart({
        title: '',
        metadata: {
            axes: {
                x: 'more values' // user selection
            }
        },
        vis: {
            axes(returnAsColumn = false) {
                return {
                    x: 'more values'
                };
            }
        }
    });

    t.context.chart.set({
        dataset,
        visualization: { axes }
    });
});

test('Render a select element with one option per column', t => {
    new SelectAxisColumnControl({
        store: t.context.chart,
        target: t.context.target,
        data: {
            axis: 'category',
            label: 'Mandatory selection'
        }
    });

    const options = $('option', t.context.target);
    t.is(options[0].value, 'titles');
    t.is(options[1].value, 'categories');
});

test('Render an additional n/a option ("-") when column selection is optional', t => {
    new SelectAxisColumnControl({
        target: t.context.target,
        store: t.context.chart,
        data: {
            axis: 'color',
            label: 'Optional selection'
        }
    });

    const options = $('option', t.context.target);
    t.is(options[0].value, '-');
    t.is(options[1].value, 'titles');
    t.is(options[2].value, 'categories');
});

test('Do not render n/a option ("-") when column selection is optional but `optional` attribute is `false`', t => {
    new SelectAxisColumnControl({
        target: t.context.target,
        store: t.context.chart,
        data: {
            axis: 'color',
            label: 'Optional selection',
            optional: false
        }
    });

    const options = $('option', t.context.target);
    t.is(options[0].value, 'titles');
    t.is(options[1].value, 'categories');
});

test('Render a custom n/a option when custom label string is provided', t => {
    new SelectAxisColumnControl({
        target: t.context.target,
        store: t.context.chart,
        data: {
            axis: 'group',
            label: 'Custom n/a label'
        }
    });

    const options = $('option', t.context.target);
    t.is(options[0].value, '-');
    t.is(options[0].text, '(no selection)');
});

test('Preselect a provided option', t => {
    new SelectAxisColumnControl({
        target: t.context.target,
        store: t.context.chart,
        data: {
            axis: 'x',
            label: 'User selection'
        }
    });

    t.is($('select', t.context.target).val(), 'more values');
});

test('Accept multiple types', t => {
    new SelectAxisColumnControl({
        target: t.context.target,
        store: t.context.chart,
        data: {
            axis: 'y',
            label: 'Accept multiple types'
        }
    });

    const options = $('option', t.context.target);
    t.is(options[0].value, 'values'); // Render number column option
    t.is(options[1].value, 'more values'); // Render another number column option
    t.is(options[2].value, 'dates'); // Render date column option
});

test('Options show column names by default (when titles are not set)', t => {
    new SelectAxisColumnControl({
        store: t.context.chart,
        target: t.context.target,
        data: {
            axis: 'category',
            label: 'Mandatory selection'
        }
    });

    const options = $('option', t.context.target);
    t.is(options[0].value, 'titles'); // value uses column name
    t.is(options[0].textContent, 'titles'); // column name is displayed
});

test('Options show column titles if titles are set', t => {
    const { dataset } = t.context.chart.get();
    dataset.column(0).title('Lorem Ipsum');
    t.context.chart.set(dataset);

    new SelectAxisColumnControl({
        store: t.context.chart,
        target: t.context.target,
        data: {
            axis: 'category',
            label: 'Mandatory selection'
        }
    });

    const options = $('option', t.context.target);
    t.is(options[0].value, 'titles'); // value uses column name
    t.is(options[0].textContent, 'Lorem Ipsum'); // column title is displayed
});

test('Options show column names when titles are left empty or set to contain only spaces', t => {
    const { dataset } = t.context.chart.get();
    dataset.column(1).title(''); // set column title to empty string
    dataset.column(0).title(' '); // set column title to space character to hide it
    t.context.chart.set(dataset);

    new SelectAxisColumnControl({
        store: t.context.chart,
        target: t.context.target,
        data: {
            axis: 'category',
            label: 'Mandatory selection'
        }
    });

    const options = $('option', t.context.target);
    t.is(options[0].value, 'titles'); // value uses column name
    t.is(options[0].textContent, 'titles'); // column name is displayed
    t.is(options[1].value, 'categories'); // value uses column name
    t.is(options[1].textContent, 'categories'); // column name is displayed
});

test('Does not error when initialized without axes', t => {
    t.context.chart.set({
        visualization: {} // no axes present
    });

    // neither `axis` nor `visualization.axes` set:
    t.notThrows(
        () =>
            new SelectAxisColumnControl({
                store: t.context.chart,
                target: t.context.target
            })
    );
});
