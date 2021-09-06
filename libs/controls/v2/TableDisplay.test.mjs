/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';
import sinon from 'sinon';

import TableDisplay from './TableDisplay.html';

const columnHeaders = [
    { title: 'One sortable header', orderBy: 'foo' },
    { title: 'Two sortable headers', orderBy: 'bar' },
    { title: 'Three sortable headers', orderBy: 'baz' },
    { title: 'One static header' },
    { title: 'Two static headers' }
];

test.beforeEach(t => {
    t.context = $('<div />');
    $(document.body)
        .empty()
        .append(t.context);
});

test('Render table rows passed as children', t => {
    new TableDisplay({
        target: t.context[0],
        data: { columnHeaders },
        slots: { default: $('<tr><td>TEST</td></tr>').get(0) }
    });

    t.is(t.context.find('tbody').html(), '<tr><td>TEST</td></tr>');
});

test('Render a "th" element for each header item', t => {
    new TableDisplay({
        target: t.context[0],
        data: { columnHeaders }
    });

    t.is(t.context.find('th').get().length, 5);
    t.is(t.context.find('th:nth-child(1)').text(), 'One sortable header');
    t.is(t.context.find('th:nth-child(2)').text(), 'Two sortable headers');
    t.is(t.context.find('th:nth-child(3)').text(), 'Three sortable headers');
    t.is(t.context.find('th:nth-child(4)').text(), 'One static header');
    t.is(t.context.find('th:nth-child(5)').text(), 'Two static headers');
});

test('Render links for items where an "orderBy" prop is provided', t => {
    new TableDisplay({
        target: t.context[0],
        data: { columnHeaders }
    });

    const linkElements = t.context.find('a');
    t.is(linkElements.get().length, 3);

    t.is(linkElements.get(0).href, '?orderBy=foo');
    t.is(linkElements.get(1).href, '?orderBy=bar');
    t.is(linkElements.get(2).href, '?orderBy=baz');
});

test('Render active state for selected link', t => {
    new TableDisplay({
        target: t.context[0],
        data: { columnHeaders, orderBy: 'bar', order: 'ASC' }
    });

    const linkElements = t.context.find('a');
    t.false(linkElements.get(0).classList.contains('sortable-asc'));
    t.true(linkElements.get(1).classList.contains('sortable-asc'));
    t.false(linkElements.get(2).classList.contains('sortable-asc'));
});

test('Clicking a link should trigger a "sort" event with "order" and "orderBy" arguments', t => {
    const table = new TableDisplay({
        target: t.context[0],
        data: { columnHeaders }
    });

    const callback = sinon.spy();
    table.on('sort', callback);

    t.context.find('a')[1].click();

    t.deepEqual(callback.firstCall.args[0], { orderBy: 'bar', order: 'ASC' });
});

test('Clicking a link repeatedly should trigger "sort" events with alternating sort order ', t => {
    const table = new TableDisplay({
        target: t.context[0],
        data: { columnHeaders, orderBy: 'foo', order: 'DESC' }
    });

    const sortLink = t.context.find('a')[1];
    const callback = sinon.spy();

    table.on('sort', callback);

    sortLink.click();
    t.deepEqual(callback.lastCall.args[0], { orderBy: 'bar', order: 'ASC' });

    sortLink.click();
    t.deepEqual(callback.lastCall.args[0], { orderBy: 'bar', order: 'DESC' });

    sortLink.click();
    t.deepEqual(callback.lastCall.args[0], { orderBy: 'bar', order: 'ASC' });

    sortLink.click();
    t.deepEqual(callback.lastCall.args[0], { orderBy: 'bar', order: 'DESC' });
});
