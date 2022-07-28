import SwitchControl from './SwitchControl.svelte';
import { fireEvent, render } from '@testing-library/svelte';
import { createSlots } from '../../../../../../libs/controls/v3/test/helpers/utils.js';
import { tick } from 'svelte';

const renderWithProps = props => {
    const content = document.createElement('span');
    content.textContent = 'My content';
    return render(SwitchControl, {
        props: {
            uid: 'test',
            $$slots: createSlots({ default: content }),
            $$scope: {},
            ...props
        }
    });
};

describe('SwitchControl', function () {
    beforeEach(() => {});

    it('with value true renders a checked input, label and content', () => {
        const { getByText, getByRole } = renderWithProps({
            label: 'My label',
            value: true
        });

        expect(getByRole('button').querySelector('input').checked).to.equal(true);
        expect(getByText('My label')).to.exist;
        expect(getByText('My content')).to.exist;
    });

    it('without value renders an unchecked input and no content', () => {
        const { getByText, queryByText, getByRole } = renderWithProps({
            label: 'My label'
        });

        const input = getByRole('button').querySelector('input');
        expect(getByText('My label')).to.exist;
        expect(input.checked).to.equal(false);
        expect(input.disabled).to.equal(false);
        expect(input.indeterminate).to.equal(false);
        expect(queryByText('My content')).to.equal(null);
    });

    it('with value false renders an unchecked input and no content', () => {
        const { getByText, queryByText, getByRole } = renderWithProps({
            label: 'My label',
            value: false
        });

        const input = getByRole('button').querySelector('input');
        expect(getByText('My label')).to.exist;
        expect(input.checked).to.equal(false);
        expect(input.disabled).to.equal(false);
        expect(input.indeterminate).to.equal(false);
        expect(queryByText('My content')).to.equal(null);
    });

    it('disabled renders no content', () => {
        const { getByText, queryByText, getByRole } = renderWithProps({
            label: 'My label',
            disabled: true,
            value: true
        });

        const input = getByRole('button').querySelector('input');
        expect(getByText('My label')).to.exist;
        expect(input.checked).to.equal(true);
        expect(input.disabled).to.equal(true);
        expect(input.indeterminate).to.equal(false);
        expect(queryByText('My content')).to.equal(null);
    });

    it("disabled with disabledState 'on' renders content", () => {
        const { getByText, getByRole } = renderWithProps({
            label: 'My label',
            value: true,
            disabled: true,
            disabledState: 'on'
        });
        const input = getByRole('button').querySelector('input');
        expect(getByText('My label')).to.exist;
        expect(input.disabled).to.equal(true);
        expect(getByText('My content')).to.exist;
    });

    it("disabled with disabledState 'off' renders no content", () => {
        const { getByText, queryByText, getByRole } = renderWithProps({
            label: 'My label',
            value: true,
            disabled: true,
            disabledState: 'off'
        });

        const input = getByRole('button').querySelector('input');
        expect(getByText('My label')).to.exist;
        expect(input.disabled).to.equal(true);
        expect(queryByText('My content')).to.equal(null);
    });

    it('disabled with message renders the message', () => {
        const { getByText } = renderWithProps({
            label: 'My label',
            disabled: true,
            disabledMessage: 'My disabled message'
        });

        expect(getByText('My disabled message')).to.exist;
    });

    it('with value true and indeterminate true renders an indeterminate input and no content', () => {
        const { getByText, queryByText, getByRole } = renderWithProps({
            label: 'My label',
            indeterminate: true,
            value: true
        });

        const input = getByRole('button').querySelector('input');
        expect(getByText('My label')).to.exist;
        expect(input.checked).to.equal(true);
        expect(input.disabled).to.equal(false);
        expect(input.indeterminate).to.equal(true);
        expect(queryByText('My content')).to.equal(null);
    });

    it('without slots renders no content', () => {
        const { queryByText } = renderWithProps({
            label: 'My label',
            value: true,
            $$slots: undefined
        });

        expect(queryByText('My content')).to.equal(null);
    });

    it('with help message renders the help message', () => {
        const { container } = renderWithProps({
            label: 'My label',
            value: true,
            tooltip: 'My help'
        });
        expect(container.querySelector('.sidehelp')).to.exist;
    });

    it('enabled and unchecked shows content when clicked and emits an event', async () => {
        const { getByText, getByRole, component } = renderWithProps({
            label: 'My label',
            value: false
        });
        let toggleEvtValue = null;
        component.$on('toggle', evt => (toggleEvtValue = evt.detail));

        const input = getByRole('button').querySelector('input');
        await fireEvent(
            input,
            new MouseEvent('click', {
                bubbles: true
            })
        );
        expect(getByText('My label')).to.exist;
        expect(input.checked).to.equal(true);
        expect(toggleEvtValue).to.equal(true);
        expect(component.value).to.equal(true);
        expect(getByText('My content')).to.exist;
    });

    it('enabled and checked hides content when clicked and emits an event', async () => {
        const { getByText, queryByText, getByRole, component } = renderWithProps({
            label: 'My label',
            value: true
        });
        let toggleEvtValue = null;
        component.$on('toggle', evt => (toggleEvtValue = evt.detail));

        const waitForTransition = new Promise(resolve => {
            component.$on('outroend', async () => {
                await tick();
                resolve();
            });
        });

        const input = getByRole('button').querySelector('input');
        await fireEvent(
            input,
            new MouseEvent('click', {
                bubbles: true
            })
        );
        expect(getByText('My label')).to.exist;
        expect(input.checked).to.equal(false);
        expect(toggleEvtValue).to.equal(false);
        expect(component.value).to.equal(false);
        await waitForTransition;
        expect(queryByText('My content')).to.equal(null);
    });

    it("disabled doesn't show content when clicked and doesn't emit an event", async () => {
        const { queryByText, getByRole, component } = renderWithProps({
            label: 'My label',
            value: true,
            disabled: true
        });
        let toggleEvtValue = null;
        component.$on('toggle', evt => (toggleEvtValue = evt.detail));

        expect(queryByText('My content')).to.equal(null);
        const input = getByRole('button').querySelector('input');
        await fireEvent(
            input,
            new MouseEvent('click', {
                bubbles: true
            })
        );
        expect(queryByText('My content')).to.equal(null);
        expect(input.checked).to.equal(false);
        expect(component.value).to.equal(true);
        expect(toggleEvtValue).to.equal(null);
    });

    it('indeterminate checked shows content when clicked and emits an event', async () => {
        const { queryByText, getByRole, component } = renderWithProps({
            label: 'My label',
            value: false,
            indeterminate: true
        });
        let toggleEvtValue = null;
        component.$on('toggle', evt => (toggleEvtValue = evt.detail));

        expect(queryByText('My content')).to.equal(null);
        const input = getByRole('button').querySelector('input');
        await fireEvent(
            input,
            new MouseEvent('click', {
                bubbles: true
            })
        );
        expect(queryByText('My content')).to.exist;
        expect(input.checked).to.equal(true);
        expect(component.value).to.equal(true);
        expect(toggleEvtValue).to.equal(true);
    });
});
