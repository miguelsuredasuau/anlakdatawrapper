/* eslint-disable no-unused-expressions */

import ColorblindCheck from './ColorblindCheck.svelte';
import { renderWithContext, setConfig } from '../../../test-utils';
import { loadLocales } from '../../../test-utils/setup-locales.mjs';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';

setConfig({ testIdAttribute: 'data-uid' });
chai.use(chaiDom);

describe('ColorblindCheck', () => {
    let result;
    let contentWindow;

    beforeEach(async () => {
        await loadLocales();

        contentWindow = {
            dispatchEvent: sinon.spy(),
            __dw: {
                vis: {
                    colorMode: sinon.spy()
                },
                render: sinon.spy()
            }
        };

        const iframe = {
            getContext: callback => callback(contentWindow)
        };

        result = await renderWithContext(ColorblindCheck, {
            uid: 'test',
            iframe
        });
    });

    describe('initial rendering', () => {
        it('renders a button for each color mode', () => {
            expect(result.getByTestId('test-normal')).to.exist;
            expect(result.getByTestId('test-deuteranopia')).to.exist;
            expect(result.getByTestId('test-protanopia')).to.exist;
            expect(result.getByTestId('test-tritanopia')).to.exist;
            expect(result.getByTestId('test-achromatopsia')).to.exist;
        });

        it('renders a button for each type of color blindness', () => {
            expect(result.getByTestId('test-normal')).to.have.class('is-selected');
        });
    });

    describe('clicking a button', () => {
        it('forces the preview to re-render with the respective color mode', () => {
            const tritanopiaButton = result.getByTestId('test-tritanopia');
            tritanopiaButton.click();
            expect(contentWindow.__dw.vis.colorMode.calledWith('tritanopia')).to.be.true;
            expect(contentWindow.__dw.render.calledOnce).to.be.true;
        });
    });
});
