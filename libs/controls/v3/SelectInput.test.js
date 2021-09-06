/* eslint-disable no-new */
import SelectInput from './SelectInput.svelte';
import test from 'ava';
import { tick } from 'svelte';

test.beforeEach(t => {
    t.context = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(t.context);
});

test.serial('SelectInput renders a select element with all possible properties', t => {
    new SelectInput({
        target: t.context,
        props: {
            disabled: true,
            options: [
                { value: 'foo', label: 'Foo' },
                { value: 'bar', label: 'Bar' }
            ],
            optgroups: [
                {
                    label: 'My optgroup',
                    options: [
                        { value: 'spam', label: 'Spam' },
                        { value: 'lorem', label: 'Ipsum' }
                    ]
                }
            ],
            value: 'bar',
            width: '123px'
        }
    });

    const select = t.context.querySelector('select');
    t.is(select.value, 'bar');
    t.is(select.disabled, true);
    t.is(select.style.width, '123px');
    const options = Array.from(select.children).filter(el => el.matches('option'));
    t.is(options[0].innerHTML, 'Foo');
    t.is(options[1].innerHTML, 'Bar');
    const optgroupOptions = select.querySelectorAll('optgroup option');
    t.is(optgroupOptions[0].innerHTML, 'Spam');
    t.is(optgroupOptions[1].innerHTML, 'Ipsum');
});

test.serial("SelectInput sets the 'value' property and emits a change event when an option is selected", async t => {
    const component = new SelectInput({
        target: t.context,
        props: {
            options: [
                { value: 'foo', label: 'Foo' },
                { value: 'bar', label: 'Bar' }
            ],
            value: null
        }
    });
    let changeValue = null;
    component.$on('change', evt => (changeValue = evt.detail.target.value));

    const select = t.context.querySelector('select');
    t.is(select.value, 'foo');
    t.is(component.value, null);
    select.selectedIndex = 1;
    const event = new Event('change');
    select.dispatchEvent(event);
    await tick();
    t.is(select.value, 'bar');
    t.is(component.value, 'bar');
    t.is(changeValue, 'bar');
});
