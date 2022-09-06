import test from 'ava';
import { tick } from 'svelte';
import ModalDisplay from './ModalDisplay.svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test.serial('Render open ModalDisplay', async t => {
    new ModalDisplay({
        target: t.context,
        props: {
            title: 'ModalDisplay',
            isOpen: true
        }
    });
    t.is(t.context.querySelector('.modal .modal-title').textContent, 'ModalDisplay');
});

test.serial('Render closed ModalDisplay', async t => {
    new ModalDisplay({
        target: t.context
    });
    t.falsy(t.context.querySelector('.modal'));
});

test.serial('Open ModalDisplay', async t => {
    const modal = new ModalDisplay({
        target: t.context
    });
    t.falsy(t.context.querySelector('.modal'));
    modal.open();
    await tick();
    t.assert(t.context.querySelector('.modal'));
});

test.serial('Dismiss ModalDisplay', async t => {
    const modal = new ModalDisplay({
        target: t.context,
        props: {
            isOpen: true
        }
    });
    t.assert(t.context.querySelector('.modal'));
    modal.dismiss();
    await tick();
    t.falsy(t.context.querySelector('.modal'));
});
