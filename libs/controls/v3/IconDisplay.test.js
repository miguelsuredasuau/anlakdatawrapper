/* eslint-disable no-new */

import IconDisplay from './IconDisplay.svelte';
import test from 'ava';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('Render the specified SVG tile', t => {
    new IconDisplay({
        target: t.context,
        props: { icon: 'new' }
    });

    t.is(t.context.querySelector('svg use').getAttribute('xlink:href'), '/lib/icons/symbol/svg/sprite.symbol.svg#new');
});

test('Apply all styling options', t => {
    new IconDisplay({
        target: t.context,
        props: {
            icon: 'foo',
            class: 'pt-2',
            size: '30px',
            color: 'red',
            valign: 'middle',
            assetURL: '/some/other/path.svg'
        }
    });

    t.true(t.context.querySelector('span').classList.contains('pt-2'));
    t.is(t.context.querySelector('span').style.verticalAlign, 'middle');
    t.is(t.context.querySelector('span svg').style.width, '30px');
    t.is(t.context.querySelector('span svg').style.height, '30px');
    t.is(t.context.querySelector('span svg use').style.fill, 'red');
    t.is(t.context.querySelector('span svg use').getAttribute('xlink:href'), '/some/other/path.svg#foo');
});
