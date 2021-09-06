/* eslint-disable no-new */
import SwitchControl from './SwitchControl.svelte';
import test from 'ava';
import { createSlots } from './test/helpers/utils.js';
import { tick } from 'svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test.serial('Switch with value true renders a checked input, label and content', t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            value: true,
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });

    const input = t.context.querySelector('input');
    t.true(input.checked);
    t.true(t.context.querySelector('label').innerHTML.includes('My label'));
    t.true(t.context.querySelector('.switch-content').innerHTML.includes('My content'));
});

test.serial('Switch without value renders an unchecked input and no content', t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });

    const input = t.context.querySelector('input');
    t.false(input.checked);
    t.false(input.disabled);
    t.false(input.indeterminate);
    t.is(t.context.querySelector('.switch-content'), null);
});

test.serial('Switch with value false renders an unchecked input and no content', t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            value: false,
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });

    const input = t.context.querySelector('input');
    t.false(input.checked);
    t.is(t.context.querySelector('.switch-content'), null);
});

test.serial("Disabled Switch renders a disabled input and no content and doesn't set any extra classes on the input", t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            value: true,
            disabled: true,
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });

    const input = t.context.querySelector('input');
    t.true(input.disabled);
    t.is(t.context.querySelector('.disabled-msg'), null);
    t.is(t.context.querySelector('.switch-content'), null);
    t.false(input.classList.contains('disabled-force-checked'));
    t.false(input.classList.contains('disabled-force-unchecked'));
});

test.serial("Disabled Switch with disabledState 'on' renders content and sets class 'disabled-force-checked' on the input", t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            value: true,
            disabled: true,
            disabledState: 'on',
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });

    const input = t.context.querySelector('input');
    t.true(input.disabled);
    t.truthy(t.context.querySelector('.switch-content'));
    t.true(input.classList.contains('disabled-force-checked'));
    t.false(input.classList.contains('disabled-force-unchecked'));
});

test.serial("Disabled Switch with disabledState 'off' renders no content and sets class 'disabled-force-unchecked' on the input", t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            value: true,
            disabled: true,
            disabledState: 'off',
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });

    const input = t.context.querySelector('input');
    t.true(input.disabled);
    t.is(t.context.querySelector('.switch-content'), null);
    t.false(input.classList.contains('disabled-force-checked'));
    t.true(input.classList.contains('disabled-force-unchecked'));
});

test.serial('Disabled Switch with message renders the message', t => {
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            disabled: true,
            disabledMessage: 'My disabled message'
        }
    });

    t.true(t.context.querySelector('.disabled-msg').innerHTML.includes('My disabled message'));
});

test.serial('Switch with value true and indeterminate true renders an indeterminate input and no content', t => {
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            value: true,
            indeterminate: true
        }
    });

    const input = t.context.querySelector('input');
    t.true(input.checked);
    t.true(input.indeterminate);
    t.is(t.context.querySelector('.switch-content'), null);
});

test.serial('Switch without slots renders no content', t => {
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            value: true
        }
    });

    t.is(t.context.querySelector('.switch-content'), null);
});

test.serial('Switch with help message renders the help element', t => {
    new SwitchControl({
        target: t.context,
        props: {
            label: 'My label',
            help: 'My help'
        }
    });

    t.truthy(t.context.querySelector('.help'));
});

test.serial('Enabled unchecked Switch shows content when clicked and emits an event', async t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    const component = new SwitchControl({
        target: t.context,
        props: {
            value: false,
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });
    let toggleEvtValue = null;
    component.$on('toggle', evt => (toggleEvtValue = evt.detail));

    t.is(t.context.querySelector('.switch-content'), null);
    t.context.querySelector('input').click();
    await tick();
    t.is(toggleEvtValue, true);
    t.true(component.value);
    t.truthy(t.context.querySelector('.switch-content'));
});

test.serial('Enabled checked Switch hides content when clicked and emits an event', async t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    const component = new SwitchControl({
        target: t.context,
        props: {
            value: true,
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });
    let toggleEvtValue = null;
    component.$on('toggle', evt => (toggleEvtValue = evt.detail));
    const waitForTransition = new Promise(resolve => {
        component.$on('outroend', async evt => {
            await tick();
            resolve();
        });
    });

    t.truthy(t.context.querySelector('.switch-content'));
    t.context.querySelector('input').click();
    await tick();
    t.is(toggleEvtValue, false);
    t.false(component.value);
    await waitForTransition;
    t.is(t.context.querySelector('.switch-content'), null);
});

test.serial("Disabled Switch doesn't show content when clicked and doesn't emit an event", async t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    const component = new SwitchControl({
        target: t.context,
        props: {
            value: true,
            disabled: true,
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });
    let toggleEvtValue = null;
    component.$on('toggle', evt => (toggleEvtValue = evt.detail));

    t.is(t.context.querySelector('.switch-content'), null);
    t.context.querySelector('input').click();
    await tick();
    t.is(toggleEvtValue, null);
    t.true(component.value);
    t.is(t.context.querySelector('.switch-content'), null);
});

test.serial('Indeterminate checked Switch shows content when clicked and emits an event', async t => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    const component = new SwitchControl({
        target: t.context,
        props: {
            value: true,
            indeterminate: true,
            $$slots: createSlots({ default: content }),
            $$scope: {}
        }
    });
    let toggleEvtValue = null;
    component.$on('toggle', evt => (toggleEvtValue = evt.detail));

    t.is(t.context.querySelector('.switch-content'), null);
    t.context.querySelector('input').click();
    await tick();
    t.is(toggleEvtValue, true);
    t.true(component.value);
    t.truthy(t.context.querySelector('.switch-content'));
});
