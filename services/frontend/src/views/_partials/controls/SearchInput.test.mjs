/* eslint-disable no-unused-expressions */
import SearchInput from './SearchInput.svelte';
import { fireEvent } from '@testing-library/svelte';
import { renderWithContext, setConfig } from '../../../test-utils';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';

setConfig({ testIdAttribute: 'data-uid' });

chai.use(chaiDom);

describe('SearchInput', () => {
    describe('initial state', function () {
        it('renders an input with empty value', async () => {
            const result = await renderWithContext(SearchInput);
            const input = result.getByPlaceholderText('Search');
            expect(input).to.exist;
            expect(input).to.have.value('');
        });

        it('shows a provided value', async () => {
            const result = await renderWithContext(SearchInput, { value: 'some example query' });
            const input = result.getByPlaceholderText('Search');
            expect(input).to.have.value('some example query');
        });
    });

    describe('text input', () => {
        const onInput = sinon.spy();
        let result;

        before(async () => {
            result = await renderWithContext(SearchInput, { onInput });
            const input = result.getByPlaceholderText('Search');
            fireEvent.input(input);
        });

        it('applies an "is-loading" style', () => {
            expect(result.getByTestId('search-input')).to.have.class('is-loading');
        });

        it('does not trigger "onInput" event immediately (debounced execution)', () => {
            expect(onInput.called).to.equal(false);
        });

        it('does trigger "onInput" event after a debounce interval of 1s', done => {
            setTimeout(() => {
                expect(onInput.calledOnce).to.equal(true);
                done();
            }, 1000);
        });
    });
});
