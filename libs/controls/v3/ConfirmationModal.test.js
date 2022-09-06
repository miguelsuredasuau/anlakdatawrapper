import test from 'ava';
import { tick } from 'svelte';
import ConfirmationModal from './ConfirmationModal.svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test.serial('Render open ConfirmationModal', async t => {
    new ConfirmationModal({
        target: t.context,
        props: {
            title: 'ConfirmationModal',
            confirmButtonIcon: 'checkmark-bold',
            isOpen: true
        }
    });
    t.is(t.context.querySelector('.modal .modal-title').textContent, 'ConfirmationModal');
    t.is(t.context.querySelector('.modal .actions .btn.back').textContent, 'Back');
    t.is(t.context.querySelector('.modal .actions .btn-danger').textContent, ' Confirm');
    t.assert(t.context.querySelector('.modal .actions .btn-danger svg'));
});

test.serial('Render closed ConfirmationModal', async t => {
    new ConfirmationModal({
        target: t.context
    });
    t.falsy(t.context.querySelector('.modal'));
});

test.serial('Open ConfirmationModal', async t => {
    const modal = new ConfirmationModal({
        target: t.context
    });
    t.falsy(t.context.querySelector('.modal'));
    modal.open();
    await tick();
    t.assert(t.context.querySelector('.modal'));
});

test.serial('Dismiss ConfirmationModal', async t => {
    const modal = new ConfirmationModal({
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
