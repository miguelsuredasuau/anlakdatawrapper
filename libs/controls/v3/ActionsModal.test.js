import test from 'ava';
import { tick } from 'svelte';
import ActionsModal from './ActionsModal.svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test.serial('Render open ActionsModal', async t => {
    new ActionsModal({
        target: t.context,
        props: {
            title: 'ActionsModal',
            isOpen: true
        }
    });
    t.is(t.context.querySelector('.modal .modal-title').textContent, 'ActionsModal');
    t.is(t.context.querySelector('.modal .actions .btn').textContent, 'Back');
    t.is(
        t.context.querySelector('.modal .actions .main-actions .btn.btn-primary').textContent,
        'Primary'
    );
    t.falsy(t.context.querySelector('.modal .actions .main-actions .btn:not(.btn-primary)'));
});

test.serial('Render closed ActionsModal', async t => {
    new ActionsModal({
        target: t.context
    });
    t.falsy(t.context.querySelector('.modal'));
});

test.serial('Render ActionsModal with secondary button', async t => {
    new ActionsModal({
        target: t.context,
        props: {
            title: 'ActionsModal',
            isOpen: true,
            secondaryAction: () => null
        }
    });
    t.is(t.context.querySelector('.modal .modal-title').textContent, 'ActionsModal');
    t.is(t.context.querySelector('.modal .actions .btn').textContent, 'Back');
    t.is(
        t.context.querySelector('.modal .actions .main-actions .btn.btn-primary').textContent,
        'Primary'
    );
    t.assert(t.context.querySelector('.modal .actions .main-actions .btn:not(.btn-primary)'));
});

test.serial('Open ActionsModal', async t => {
    const modal = new ActionsModal({
        target: t.context
    });
    t.falsy(t.context.querySelector('.modal'));
    modal.open();
    await tick();
    t.assert(t.context.querySelector('.modal'));
});

test.serial('Dismiss ActionsModal', async t => {
    const modal = new ActionsModal({
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

test.serial('Perform ActionsModal primary action', async t => {
    let actionPerformed = false;
    new ActionsModal({
        target: t.context,
        props: {
            isOpen: true,
            primaryAction: () => (actionPerformed = true)
        }
    });
    t.assert(t.context.querySelector('.modal'));
    t.context.querySelector('.modal .main-actions .btn-primary').click();
    await tick();
    t.falsy(t.context.querySelector('.modal'));
    t.truthy(actionPerformed);
});

test.serial('Perform ActionsModal secondary action', async t => {
    let actionPerformed = false;
    new ActionsModal({
        target: t.context,
        props: {
            isOpen: true,
            secondaryAction: () => (actionPerformed = true)
        }
    });
    t.assert(t.context.querySelector('.modal'));
    t.context.querySelector('.modal .main-actions .btn:not(.btn-primary)').click();
    await tick();
    t.falsy(t.context.querySelector('.modal'));
    t.truthy(actionPerformed);
});
