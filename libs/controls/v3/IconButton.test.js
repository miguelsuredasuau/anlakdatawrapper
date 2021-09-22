/* eslint-disable no-new */

import test from 'ava';
import { tick } from 'svelte';
import IconButton from './IconButton.svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test('Render the specified SVG tile, text and some properties', t => {
    new IconButton({
        target: t.context,
        props: {
            icon: 'cloud-check',
            title: 'My button text',
            active: true,
            iconLeft: true
        }
    });

    t.is(t.context.querySelector('svg use').getAttribute('xlink:href'), '/lib/icons/symbol/svg/sprite.symbol.svg#cloud-check');
    t.is(t.context.querySelector('button span:not(.svg-icon)').textContent, 'My button text');
    t.true(t.context.querySelector('button').classList.contains('active'));
    t.true(t.context.querySelector('button').classList.contains('icon-left'));
});

test('Icon color and active state are reactive', async t => {
    const iconButton = new IconButton({
        target: t.context,
        props: {
            icon: 'cloud-check',
            title: 'Some text',
            active: false,
            iconLeft: true,
            iconColor: 'blue'
        }
    });

    t.false(t.context.querySelector('button').classList.contains('active'));
    t.is(t.context.querySelector('svg use').style.fill, 'blue');

    iconButton.$set({ active: true });
    await tick();
    t.true(t.context.querySelector('button').classList.contains('active'));

    iconButton.$set({ iconColor: 'red' });
    await tick();
    t.is(t.context.querySelector('svg use').style.fill, 'red');
});
