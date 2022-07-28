import TypeaheadInput from './TypeaheadInput.svelte';
import TypeaheadItemRenderer from '../../hello/sections/controls/TypeaheadItemRenderer.svelte';
import { fireEvent } from '@testing-library/svelte';
import { renderWithContext, setConfig, delay } from '../../../../test/helpers/clientUtils';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';

setConfig({ testIdAttribute: 'data-uid' });

chai.use(chaiDom);

describe('TypeaheadInput', () => {
    describe('empty typeahead input', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(TypeaheadInput, {
                uid: 'test'
            });
        });

        it('renders an input with empty value', () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.exist;
            expect(input).to.have.value('');
        });

        it('no dropdown menu is rendered', () => {
            const dropDownMenuDiv = result.getByTestId('test').querySelector('.dropdown-menu');
            expect(dropDownMenuDiv).not.to.exist;
        });

        it('no placeholder and aria-label is present', () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).not.to.have.attribute('aria-label');
            expect(input).not.to.have.attribute('placeholder');
        });

        it('no icon is rendered', () => {
            const outerDiv = result.getByTestId('test');
            expect(outerDiv.querySelector('.control')).not.to.have.class('has-icons-left');
            expect(outerDiv.querySelector('span.icon.is-left')).not.to.exist;
        });
    });

    describe('typeahead with placeholder and aria-label', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(TypeaheadInput, {
                uid: 'test',
                ariaLabel: 'my aria label',
                placeholder: 'my placeholder'
            });
        });

        it('aria-label is present', () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.have.attribute('aria-label', 'my aria label');
            expect(input).to.have.attribute('placeholder', 'my placeholder');
        });
    });

    describe('typeahead with icon', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(TypeaheadInput, {
                uid: 'test',
                icon: 'launch'
            });
        });

        it('icon is rendered', () => {
            const outerDiv = result.getByTestId('test');
            expect(outerDiv.querySelector('.control')).to.have.class('has-icons-left');
            const icon = outerDiv.querySelector('span.icon.is-left');
            expect(icon).to.exist;
        });
    });

    describe('typeahead with options', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(TypeaheadInput, {
                uid: 'test',
                noResultsMsg: 'No matches found',
                options: [
                    { value: 'fruit-1', label: 'Apple' },
                    { value: 'fruit-2', label: 'Banana' },
                    { value: 'fruit-3', label: 'Pineapple' },
                    { value: 'fruit-4', label: 'Mango' }
                ]
            });
        });

        it('show dropdown menu with matches', async () => {
            const outerDiv = result.getByTestId('test');
            const input = outerDiv.querySelector('input');
            expect(input).to.exist;
            // no dropdown menu yet
            let ddDiv = outerDiv.querySelector('.dropdown-menu');
            expect(ddDiv).not.to.exist;

            await fireEvent.focus(input);

            ddDiv = outerDiv.querySelector('.dropdown-menu');
            expect(ddDiv).to.exist;

            await fireEvent.input(input, { target: { value: 'ap' } });

            // search waits 200ms before happening
            await delay(200);

            const ddItem1 = ddDiv.querySelector('.dropdown-item:nth-child(1)');
            expect(ddItem1).to.exist;
            expect(ddItem1).to.have.attribute('href', '#/fruit-1');
            expect(ddItem1).to.have.trimmed.text('Apple');

            const ddItem2 = ddDiv.querySelector('.dropdown-item:nth-child(2)');
            expect(ddItem2).to.exist;
            expect(ddItem2).to.have.attribute('href', '#/fruit-3');
            expect(ddItem2).to.have.trimmed.text('Pineapple');

            expect(input).to.have.value('ap');
            await fireEvent.click(ddItem2);
            expect(input).to.have.value('Pineapple');
            expect(result.component.value).to.deep.equal({ value: 'fruit-3', label: 'Pineapple' });

            ddDiv = outerDiv.querySelector('.dropdown-menu');
            expect(ddDiv).not.to.exist;
        });

        it('show dropdown menu without matches', async () => {
            const outerDiv = result.getByTestId('test');
            const input = outerDiv.querySelector('input');
            expect(input).to.exist;
            // no dropdown menu yet
            let ddDiv = outerDiv.querySelector('.dropdown-menu');
            expect(ddDiv).not.to.exist;

            await fireEvent.focus(input);

            ddDiv = outerDiv.querySelector('.dropdown-menu');
            expect(ddDiv).to.exist;

            await fireEvent.input(input, { target: { value: 'xydgdj' } });

            // search waits 200ms before happening
            await delay(200);

            const ddItem1 = ddDiv.querySelector('div.dropdown-item:nth-child(1)');
            expect(ddItem1).to.exist;
            expect(ddItem1).not.to.have.attribute('href');
            expect(ddItem1).to.have.trimmed.text('No matches found');

            // escape
            await fireEvent.keyDown(input, { key: 'Escape' });
            ddDiv = outerDiv.querySelector('.dropdown-menu');
            expect(ddDiv).not.to.exist;
        });
    });

    describe('typeahead keyboard nav', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(TypeaheadInput, {
                uid: 'test',
                options: [
                    { value: 'v1', label: 'Foo 1' },
                    { value: 'v2', label: 'Bar' },
                    { value: 'v3', label: 'Foo 2' },
                    { value: 'v4', label: 'Foo 3' }
                ]
            });
        });

        it('select third item, press enter', async () => {
            const outerDiv = result.getByTestId('test');
            const input = outerDiv.querySelector('input');

            await fireEvent.focus(input);
            await fireEvent.input(input, { target: { value: 'foo' } });

            await delay(200);

            const dd = outerDiv.querySelector('.dropdown-menu');
            expect(dd).to.exist;
            expect(dd.querySelector('.dropdown-item:nth-child(1)')).to.have.class('is-active');
            expect(dd.querySelector('.dropdown-item:nth-child(2)')).not.to.have.class('is-active');
            expect(dd.querySelector('.dropdown-item:nth-child(3)')).not.to.have.class('is-active');

            // arrow down
            await fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(dd.querySelector('.dropdown-item:nth-child(1)')).not.to.have.class('is-active');
            expect(dd.querySelector('.dropdown-item:nth-child(2)')).to.have.class('is-active');
            expect(dd.querySelector('.dropdown-item:nth-child(3)')).not.to.have.class('is-active');
            // arrow down
            await fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(dd.querySelector('.dropdown-item:nth-child(1)')).not.to.have.class('is-active');
            expect(dd.querySelector('.dropdown-item:nth-child(2)')).not.to.have.class('is-active');
            expect(dd.querySelector('.dropdown-item:nth-child(3)')).to.have.class('is-active');
            // enter
            await fireEvent.keyDown(input, { key: 'Enter' });

            expect(input).to.have.value('Foo 3');
            expect(result.component.value).to.deep.equal({ value: 'v4', label: 'Foo 3' });
        });
    });

    describe('typeahead custom async search function', function () {
        let result;

        const customSearchFunc = sinon.spy(async () => {
            await delay(300);
            return [{ value: 'foo', label: 'Bar' }];
        });

        beforeEach(async () => {
            result = await renderWithContext(TypeaheadInput, {
                uid: 'test',
                search: customSearchFunc
            });
        });

        it('search function called once with query', async () => {
            const outerDiv = result.getByTestId('test');
            const input = outerDiv.querySelector('input');

            await fireEvent.focus(input);
            await fireEvent.input(input, { target: { value: 'x' } });

            const control = outerDiv.querySelector('.control');
            expect(control).not.to.have.class('is-loading');
            await delay(200);
            expect(customSearchFunc.calledOnceWith('x')).to.equal(true);
            expect(control).to.have.class('is-loading');
            await delay(310);
            expect(control).not.to.have.class('is-loading');

            const item1 = outerDiv.querySelector('.dropdown-menu .dropdown-item:nth-child(1)');

            expect(item1).to.exist;
            expect(item1).to.have.attribute('href', '#/foo');
            expect(item1).to.have.trimmed.text('Bar');
        });
    });

    describe('typeahead with custom item renderer', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(TypeaheadInput, {
                uid: 'test',
                customItemRenderer: TypeaheadItemRenderer,
                options: [
                    {
                        value: 'it',
                        label: 'Italy'
                    },
                    {
                        value: 'de',
                        label: 'Germany'
                    },
                    {
                        value: 'fr',
                        label: 'France'
                    }
                ]
            });
        });

        it('matches rendered with flag', async () => {
            const outerDiv = result.getByTestId('test');
            const input = outerDiv.querySelector('input');

            await fireEvent.focus(input);
            await fireEvent.input(input, { target: { value: 'anc' } });

            await delay(200);

            const item1 = outerDiv.querySelector('.dropdown-menu .dropdown-item');
            expect(item1).to.exist;
            expect(item1.querySelector('span.flag-icon-fr')).to.exist;
        });
    });
});
