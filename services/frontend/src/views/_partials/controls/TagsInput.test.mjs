import TagsInput from './TagsInput.svelte';
import { fireEvent } from '@testing-library/svelte';
import { renderWithContext, setConfig } from '../../../../test/helpers/clientUtils';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import { tick } from 'svelte';

setConfig({ testIdAttribute: 'data-uid' });

chai.use(chaiDom);

describe('TagsInput', () => {
    describe('when the tags are empty', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(TagsInput, { uid: 'test' });
        });

        it('renders an input with empty value', () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.exist;
            expect(input).to.have.value('');
        });

        it('renders an empty tags div', () => {
            const tagsDiv = result.getByTestId('test').querySelector('.tags');
            expect(tagsDiv).not.to.exist;
        });
    });

    describe('when here are some tags', function () {
        let result;
        const tags = ['apple', 'banana'];

        beforeEach(async () => {
            result = await renderWithContext(TagsInput, { uid: 'test', tags });
        });

        it('renders an input with comma-separate tags', () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.exist;
            expect(input).to.have.value(tags.join(', '));
        });

        it('renders a tags div with tag spans', () => {
            const tagsDiv = result.getByTestId('test').querySelector('.tags');
            expect(tagsDiv).to.exist;
            expect(tagsDiv).to.have.length(tags.length);
            expect(tagsDiv).to.contain('span.tag');
            const tagSpans = tagsDiv.querySelectorAll('span.tag');
            expect(tagSpans[0]).to.have.trimmed.text(tags[0]);
            expect(tagSpans[1]).to.have.trimmed.text(tags[1]);
        });
    });

    describe('when the user deletes a tag', function () {
        let result;
        const tags = ['apple', 'banana'];

        beforeEach(async () => {
            result = await renderWithContext(TagsInput, { uid: 'test', tags });
        });

        it('the tag span count decreases', async () => {
            const tagSpans = result.getByTestId('test').querySelectorAll('span.tag');
            expect(tagSpans[0]).to.have.trimmed.text('apple');
            await fireEvent.click(tagSpans[0].querySelector('button.delete'));
            const tagsDiv = result.getByTestId('test').querySelector('.tags');
            expect(tagsDiv).to.have.length(tags.length - 1);
            expect(tagsDiv.querySelector('span.tag')).to.have.trimmed.text('banana');
        });
    });

    describe('when the user adds a tag', function () {
        let result;
        let input;
        const tags = ['apple', 'banana'];
        const onChange = sinon.spy();

        beforeEach(async () => {
            result = await renderWithContext(TagsInput, { uid: 'test', tags });
            result.component.$on('change', onChange);
            input = result.getByTestId('test').querySelector('input');
            await fireEvent.focus(input);
            await fireEvent.input(input, { target: { value: 'apple, banana,lemon' } });
        });

        it('the new tags shows up in input and tags div', async () => {
            expect(input).to.have.value('apple, banana,lemon');
            const tagsDiv = result.getByTestId('test').querySelector('.tags');
            expect(tagsDiv).to.exist;
            expect(tagsDiv).to.have.length(3);
        });

        it('the input gets re-serialized on blur', async () => {
            await fireEvent.blur(input);
            expect(input).to.have.value('apple, banana, lemon');
        });

        it('a change event is fired', async () => {
            expect(onChange.called).to.equal(true);
        });
    });

    describe('when user enters comma at the end', function () {
        let result;
        const tags = ['apple', 'banana'];

        beforeEach(async () => {
            result = await renderWithContext(TagsInput, { uid: 'test', tags });
        });

        it("we don't render an empty tag and remove trailing comma on blur", async () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.exist;
            await fireEvent.focus(input);
            await fireEvent.input(input, { target: { value: 'apple, banana,' } });
            expect(input).to.have.value('apple, banana,');
            const tagsDiv = result.getByTestId('test').querySelector('.tags');
            expect(tagsDiv).to.exist;
            expect(tagsDiv).to.have.length(2);

            await fireEvent.blur(input);
            expect(input).to.have.value('apple, banana');
        });
    });

    describe('when user enters mixed-case tags', function () {
        let result;
        const tags = ['apple', 'banana'];

        beforeEach(async () => {
            result = await renderWithContext(TagsInput, { uid: 'test', tags });
        });

        it('we lowercase the tags on blur', async () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.exist;
            await fireEvent.focus(input);
            await fireEvent.input(input, { target: { value: 'Foo, BAR, bAz' } });
            // input still shows user version
            expect(input).to.have.value('Foo, BAR, bAz');
            const tagsDiv = result.getByTestId('test').querySelector('.tags');
            expect(tagsDiv).to.have.length(3);
            expect(tagsDiv.querySelector('span.tag')).to.have.trimmed.text('foo');

            await fireEvent.blur(input);
            expect(input).to.have.value('foo, bar, baz');
        });
    });

    describe('when user enters a duplicate tag', function () {
        let result;
        const tags = ['apple', 'banana'];

        beforeEach(async () => {
            result = await renderWithContext(TagsInput, { uid: 'test', tags });
        });

        it('we do not add it twice', async () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.exist;
            await fireEvent.focus(input);
            await fireEvent.input(input, { target: { value: 'apple, banana, Apple' } });
            expect(input).to.have.value('apple, banana, Apple');
            const tagsDiv = result.getByTestId('test').querySelector('.tags');
            expect(tagsDiv).to.exist;
            expect(tagsDiv).to.have.length(2);

            await fireEvent.blur(input);
            expect(input).to.have.value('apple, banana');
        });
    });

    describe('when tags prop changes from outside', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(TagsInput, { uid: 'test', tags: ['foo'] });
        });

        it('the tags input and spans get updated', async () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.have.value('foo');
            const tagsDiv = result.getByTestId('test').querySelector('.tags');
            expect(tagsDiv).to.have.length(1);

            result.component.$set({ tags: ['foo', 'bar'] });
            await tick();

            expect(input).to.have.value('foo, bar');
            expect(tagsDiv).to.have.length(2);
        });
    });
});
