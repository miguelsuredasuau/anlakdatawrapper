/* eslint-disable no-unused-expressions */
import test from 'ava';

import TypeAheadInput from './TypeAheadInput.svelte';
import { configure, fireEvent, render } from '@testing-library/svelte';
import { nanoid } from 'nanoid';
import sinon from 'sinon';
import TypeAheadCustomItem from './TypeAheadCustomItem.svelte';

configure({ testIdAttribute: 'data-uid' });

test.before(async t => {
    t.context.renderWithProps = async props => {
        const containerId = nanoid(5);
        const container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);

        return render(TypeAheadInput, { uid: 'test', ...props }, { container });
    };
});

test('when empty renders an input with empty value', async t => {
    const { getByTestId } = await t.context.renderWithProps();
    const input = getByTestId('test').querySelector('input');
    t.truthy(input);
    t.is(input.value, '');
});

test('when empty no dropdown menu is rendered', async t => {
    const { getByTestId } = await t.context.renderWithProps();
    const dropDownMenuDiv = getByTestId('test').querySelector('.dropdown-menu');
    t.is(dropDownMenuDiv, null);
});

test('when empty no placeholder and aria-label is present', async t => {
    const { getByTestId } = await t.context.renderWithProps();
    const input = getByTestId('test').querySelector('input');
    t.falsy(input['aria-label']);
    t.falsy(input['placeholder']);
});

test('when empty no icon is rendered', async t => {
    const { getByTestId } = await t.context.renderWithProps();
    const icon = getByTestId('test').querySelector('.svg-icon');
    t.falsy(icon);
});

test('with placeholder and aria-label', async t => {
    const { getByLabelText, getByPlaceholderText } = await t.context.renderWithProps({
        ariaLabel: 'my aria label',
        placeholder: 'my placeholder'
    });
    t.truthy(getByLabelText('my aria label'));
    t.truthy(getByPlaceholderText('my placeholder'));
});

test('with icon', async t => {
    const { getByTestId } = await t.context.renderWithProps({
        icon: 'new'
    });
    t.truthy(getByTestId('test').querySelector('.svg-icon'));
});

test('with initial value', async t => {
    const { component, getByDisplayValue } = await t.context.renderWithProps({
        value: { value: 'test', label: 'Test Label' }
    });
    t.truthy(getByDisplayValue('Test Label'));
    t.deepEqual(component.value, { value: 'test', label: 'Test Label' });
});

test('with options', async t => {
    const { component, getByTestId, getByText, getByDisplayValue, queryByText } =
        await t.context.renderWithProps({
            options: [
                { value: 'fruit-1', label: 'Apple' },
                { value: 'fruit-2', label: 'Banana' },
                { value: 'fruit-3', label: 'Pineapple' },
                { value: 'fruit-4', label: 'Mango' }
            ]
        });

    // no dropdown menu yet
    const outerDiv = getByTestId('test');
    const input = outerDiv.querySelector('input');
    t.truthy(input);
    t.falsy(queryByText('Banana'));
    t.falsy(queryByText('Apple'));
    t.falsy(queryByText('Pineapple'));
    t.falsy(queryByText('Mango'));
    t.falsy(component.value);

    // dropdown is displayed
    await fireEvent.focus(input);
    t.truthy(getByText('Apple'));
    t.truthy(getByText('Banana'));
    t.truthy(getByText('Pineapple'));
    t.truthy(getByText('Mango'));

    // select an option
    const option = getByText('Banana');
    await fireEvent.click(option);
    t.truthy(getByDisplayValue('Banana'));
    t.falsy(queryByText('Apple'));
    t.falsy(queryByText('Pineapple'));
    t.falsy(queryByText('Mango'));
    t.deepEqual(component.value, { value: 'fruit-2', label: 'Banana' });
});

test('with options matched by query', async t => {
    const { component, getByTestId, getByText, getByDisplayValue, queryByText } =
        await t.context.renderWithProps({
            options: [
                { value: 'fruit-1', label: 'Apple' },
                { value: 'fruit-2', label: 'Banana' },
                { value: 'fruit-3', label: 'Pineapple' },
                { value: 'fruit-4', label: 'Mango' }
            ]
        });

    // no dropdown menu yet
    const outerDiv = getByTestId('test');
    const input = outerDiv.querySelector('input');
    t.truthy(input);
    t.falsy(queryByText('Banana'));
    t.falsy(queryByText('Apple'));
    t.falsy(queryByText('Pineapple'));
    t.falsy(queryByText('Mango'));

    // dropdown is displayed with filtered options
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'apple' } });
    await delay(200); // input is debounced
    t.truthy(getByText('Apple'));
    t.falsy(queryByText('Banana'));
    t.truthy(getByText('Pine')); // Pineapple broken up into two elements because of highlighting
    t.truthy(getByText('apple'));
    t.truthy(getByText('apple'));
    t.falsy(queryByText('Mango'));

    // select an option
    const option = getByText('Pine');
    await fireEvent.click(option);
    t.truthy(getByDisplayValue('Pineapple'));
    t.falsy(queryByText('Apple'));
    t.falsy(queryByText('Banana'));
    t.falsy(queryByText('Mango'));
    t.deepEqual(component.value, { value: 'fruit-3', label: 'Pineapple' });

    // On re-focus only matched options are displayed again
    await fireEvent.focus(input);
    t.truthy(getByText('Apple'));
    t.falsy(queryByText('Banana'));
    t.truthy(getByText('Pineapple'));
    t.falsy(queryByText('Mango'));
    t.deepEqual(component.value, { value: 'fruit-3', label: 'Pineapple' });
});

test('with keyboard navigation', async t => {
    const { component, getByTestId, getByText, getByDisplayValue, queryByText } =
        await t.context.renderWithProps({
            placeholder: 'Placeholder',
            options: [
                { value: 'fruit-1', label: 'Apple' },
                { value: 'fruit-2', label: 'Banana' },
                { value: 'fruit-3', label: 'Pineapple' },
                { value: 'fruit-4', label: 'Mango' }
            ]
        });

    // no dropdown menu yet
    const outerDiv = getByTestId('test');
    const input = outerDiv.querySelector('input');
    t.truthy(input);
    t.falsy(queryByText('Banana'));
    t.falsy(queryByText('Apple'));
    t.falsy(queryByText('Pineapple'));
    t.falsy(queryByText('Mango'));

    // dropdown is displayed with filtered options
    await fireEvent.focus(input);
    t.truthy(getByText('Apple'));
    t.truthy(getByText('Banana'));
    t.truthy(getByText('Pineapple'));
    t.truthy(getByText('Mango'));

    // cancel selection
    await fireEvent.keyDown(input, { key: 'Escape' });
    t.falsy(queryByText('Apple'));
    t.falsy(queryByText('Banana'));
    t.falsy(queryByText('Pineapple'));
    t.falsy(queryByText('Mango'));
    t.falsy(component.value);

    // select an option
    await fireEvent.focus(input);
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });
    t.truthy(getByDisplayValue('Banana'));
    t.falsy(queryByText('Apple'));
    t.falsy(queryByText('Pineapple'));
    t.falsy(queryByText('Mango'));
    t.deepEqual(component.value, { value: 'fruit-2', label: 'Banana' });
});

test('with no options matched by query', async t => {
    const { component, getByTestId, getByText, queryByText } = await t.context.renderWithProps({
        noResultsMsg: 'No matches found',
        options: [
            { value: 'fruit-1', label: 'Apple' },
            { value: 'fruit-2', label: 'Banana' },
            { value: 'fruit-3', label: 'Pineapple' },
            { value: 'fruit-4', label: 'Mango' }
        ]
    });

    // no dropdown menu yet
    const outerDiv = getByTestId('test');
    const input = outerDiv.querySelector('input');
    t.truthy(input);
    t.falsy(queryByText('Banana'));
    t.falsy(queryByText('Apple'));
    t.falsy(queryByText('Pineapple'));
    t.falsy(queryByText('Mango'));

    // dropdown is displayed with filtered options
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'xyz' } });
    await delay(200); // input is debounced
    t.falsy(queryByText('Apple'));
    t.falsy(queryByText('Banana'));
    t.falsy(queryByText('Pineapple'));
    t.falsy(queryByText('Mango'));
    t.truthy(getByText('No matches found'));
    t.falsy(component.value);
});

test('with custom search', async t => {
    const customSearchFunc = sinon.spy(async () => {
        await delay(300);
        return [{ value: 'fruit-5', label: 'Papaya' }];
    });

    const { component, getByTestId, getByText, getByDisplayValue, queryByText } =
        await t.context.renderWithProps({
            search: customSearchFunc,
            searchingMsg: 'Is searching'
        });

    // no dropdown menu yet
    const outerDiv = getByTestId('test');
    const input = outerDiv.querySelector('input');
    t.truthy(input);
    t.falsy(queryByText('Papaya'));
    t.falsy(queryByText('Is searching'));
    t.falsy(component.value);

    // dropdown is not displayed yet
    await fireEvent.focus(input);
    // no helper message after focus and before input
    const helperMessageEl = outerDiv.querySelector('.helper-message');
    t.falsy(helperMessageEl);
    await fireEvent.input(input, { target: { value: 'pap' } });
    await delay(200); // input is debounced
    t.falsy(queryByText('Papaya'));
    t.truthy(getByText('Is searching'));
    t.is(customSearchFunc.callCount, 1);

    await delay(310);
    t.falsy(queryByText('Is searching'));
    t.truthy(getByText('Pap')); // broken into two elements because of highlighting
    t.truthy(getByText('aya'));

    // select an option
    const option = getByText('aya');
    await fireEvent.click(option);
    t.truthy(getByDisplayValue('Papaya'));
    t.deepEqual(component.value, { value: 'fruit-5', label: 'Papaya' });

    // On re-focus only matched options are displayed again
    await fireEvent.focus(input);
    t.truthy(getByText('Papaya'));
});

test('with custom renderer', async t => {
    const { component, getByTestId, getByText, getByDisplayValue, queryByText } =
        await t.context.renderWithProps({
            customItemRenderer: TypeAheadCustomItem,
            options: [
                { value: 'fruit-1', label: 'Apple' },
                { value: 'fruit-2', label: 'Banana' },
                { value: 'fruit-3', label: 'Pineapple' },
                { value: 'fruit-4', label: 'Mango' }
            ]
        });

    // no dropdown menu yet
    const outerDiv = getByTestId('test');
    const input = outerDiv.querySelector('input');
    t.truthy(input);
    t.falsy(queryByText('Your option: Banana'));
    t.falsy(queryByText('Your option: Apple'));
    t.falsy(queryByText('Your option: Pineapple'));
    t.falsy(queryByText('Your option: Mango'));
    t.falsy(component.value);

    // dropdown is displayed
    await fireEvent.focus(input);
    t.truthy(getByText('Your option: Apple'));
    t.truthy(getByText('Your option: Banana'));
    t.truthy(getByText('Your option: Pineapple'));
    t.truthy(getByText('Your option: Mango'));

    // select an option
    const option = getByText('Your option: Banana');
    await fireEvent.click(option);
    t.truthy(getByDisplayValue('Banana'));
    t.falsy(queryByText('Your option: Apple'));
    t.falsy(queryByText('Your option: Pineapple'));
    t.falsy(queryByText('Your option: Mango'));
    t.deepEqual(component.value, { value: 'fruit-2', label: 'Banana' });
});

export function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
