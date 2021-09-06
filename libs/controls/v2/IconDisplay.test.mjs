/* eslint no-new: 0 */

import test from 'ava';
import $ from 'cash-dom';

import IconDisplay from './IconDisplay.html';

test.beforeEach(t => {
    const rootElement = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(rootElement);
    t.context = $(rootElement);
});

test('Render the specified SVG tile', t => {
    new IconDisplay({
        target: t.context[0],
        data: { icon: 'new' }
    });

    t.is(t.context.find('svg use').attr('xlink:href'), '/lib/icons/symbol/svg/sprite.symbol.svg#new');
});

test('Apply all styling options', t => {
    new IconDisplay({
        target: t.context[0],
        data: {
            icon: 'foo',
            class: 'pt-2',
            size: '30px',
            color: 'red',
            valign: 'middle',
            assetURL: '/some/other/path.svg'
        }
    });

    t.true(t.context.find('span').hasClass('pt-2'));
    t.is(t.context.find('span').css('vertical-align'), 'middle');
    t.is(t.context.find('span svg').css('width'), '30px');
    t.is(t.context.find('span svg').css('height'), '30px');
    t.is(t.context.find('span svg use').css('fill'), 'red');
    t.is(t.context.find('span svg use').attr('xlink:href'), '/some/other/path.svg#foo');
});
