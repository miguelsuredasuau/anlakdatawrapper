/* eslint-disable no-new */

import test from 'ava';
import { tick } from 'svelte';
import DropdownButton from './DropdownButton.svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test.serial('Choosing new dropdown option updates button text', async t => {
    new DropdownButton({
        target: t.context,
        props: {
            value: 'action-1',
            options: [
                { label: 'Action 1', value: 'action-1' },
                { label: 'Action 2', value: 'action-2' }
            ]
        }
    });
    t.is(t.context.querySelector('.dropdown-button > button').textContent, 'Action 1');
    t.context.querySelector('.dropdown-input-btn').click();
    await tick();
    t.context.querySelector('[href="#/action-2"]').click();
    await tick();
    t.is(t.context.querySelector('.dropdown-button > button').textContent, 'Action 2');
});
