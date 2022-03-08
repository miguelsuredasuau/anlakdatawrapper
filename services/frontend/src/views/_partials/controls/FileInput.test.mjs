/* eslint-disable no-unused-expressions */

import FileInput from './FileInput.svelte';
import { fireEvent, createEvent } from '@testing-library/svelte';
import { renderWithContext, setConfig, delay } from '../../../test-utils';
import { loadLocales } from '../../../test-utils/setup-locales.mjs';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';

setConfig({ testIdAttribute: 'data-uid' });

chai.use(chaiDom);

describe('FileInput', () => {
    describe('default file input', function () {
        let result;
        const checkEventDetail = sinon.spy();
        const onChange = sinon.spy(event => checkEventDetail(event.detail));

        beforeEach(async () => {
            await loadLocales();
            result = await renderWithContext(FileInput, {
                uid: 'test'
            });
            result.component.$on('change', onChange);
        });

        it('renders an input with empty value', () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.exist;
            expect(input).to.have.value('');
        });

        it('renders the default file label', () => {
            const fileLabel = result.getByTestId('test').querySelector('.file-label');
            expect(fileLabel).to.exist;
            expect(fileLabel).to.have.trimmed.text('Choose a file…');
        });

        it('renders empty file info', () => {
            const fileInfo = result.getByTestId('test').querySelector('.file-name');
            expect(fileInfo).to.exist;
            expect(fileInfo).to.have.trimmed.text('');
        });

        it('updates value on select event', async () => {
            const input = result.getByTestId('test').querySelector('input');
            const files = [{ name: 'testfile.txt', size: 12345 }];
            await fireEvent(
                input,
                createEvent('change', input, {
                    target: { files }
                })
            );
            await delay(100);
            const fileInfo = result.getByTestId('test').querySelector('.file-name');
            expect(fileInfo).to.have.trimmed.text('testfile.txt');
            expect(onChange.calledOnce).to.be.true;
            expect(checkEventDetail.calledWith(sinon.match({ file: files[0] }))).to.be.true;
        });
    });

    describe('multiple file input', function () {
        let result;
        const checkEventDetail = sinon.spy();
        const onChange = sinon.spy(event => checkEventDetail(event.detail));

        beforeEach(async () => {
            await loadLocales();
            result = await renderWithContext(FileInput, {
                uid: 'test',
                multiple: true
            });
            result.component.$on('change', onChange);
        });

        it('updates value on select event', async () => {
            const input = result.getByTestId('test').querySelector('input');
            const files = [
                { name: 'testfile.txt', size: 12345 },
                { name: 'another.txt', size: 5432 }
            ];
            await fireEvent(
                input,
                createEvent('change', input, {
                    target: { files }
                })
            );
            await delay(100);
            const fileInfo = result.getByTestId('test').querySelector('.file-name');
            expect(fileInfo).to.have.trimmed.text('selected 2 files');
            expect(onChange.calledOnce).to.be.true;
            expect(checkEventDetail.calledWith(sinon.match({ files }))).to.be.true;
        });
    });

    describe('file input with single file', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(FileInput, {
                uid: 'test',
                value: {
                    name: 'myfile.txt',
                    size: 123456,
                    type: 'plain/text'
                }
            });
        });

        it('renders correct file info', () => {
            const fileInfo = result.getByTestId('test').querySelector('.file-name');
            expect(fileInfo).to.exist;
            expect(fileInfo).to.have.trimmed.text('myfile.txt');
        });
    });

    describe('file input with multple files', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(FileInput, {
                uid: 'test',
                multiple: true,
                value: [
                    {
                        name: 'myfile.txt',
                        size: 123456,
                        type: 'plain/text'
                    },
                    {
                        name: 'another.txt',
                        size: 5000,
                        type: 'plain/text'
                    }
                ]
            });
        });

        it('renders correct file info', () => {
            const fileInfo = result.getByTestId('test').querySelector('.file-name');
            expect(fileInfo).to.have.trimmed.text('selected 2 files');
        });
    });

    describe('file input with showInfo=false', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(FileInput, {
                uid: 'test',
                showInfo: false,
                value: {
                    name: 'myfile.txt',
                    size: 123456,
                    type: 'plain/text'
                }
            });
        });

        it('renders no file info', () => {
            const fileInfo = result.getByTestId('test').querySelector('.file-name');
            expect(fileInfo).not.to.exist;
        });
    });

    describe('file input with accept and className', function () {
        let result;

        beforeEach(async () => {
            result = await renderWithContext(FileInput, {
                uid: 'test',
                showInfo: false,
                className: 'is-primary is-large',
                accept: 'image/png'
            });
        });

        it('passes on accept attribute', () => {
            const input = result.getByTestId('test').querySelector('input');
            expect(input).to.have.attribute('accept', 'image/png');
        });

        it('passes on class names', () => {
            const input = result.getByTestId('test');
            expect(input).to.have.class('file');
            expect(input).to.have.class('is-primary');
            expect(input).to.have.class('is-large');
        });
    });
});
