/* eslint-disable no-unused-expressions */

import PreviewResizer from './PreviewResizer.svelte';
import { tick } from 'svelte';
import { writable, readable, get as getStoreValue } from 'svelte/store';
import {
    renderWithContext,
    setConfig,
    mockTranslations,
    storeWithSetKey,
    clickOn,
    changeValueTo
} from '../../../test-utils';
import chai, { expect } from 'chai';
import { cloneDeep } from 'lodash';
import assign from 'assign-deep';
import chaiDom from 'chai-dom';

setConfig({ testIdAttribute: 'data-uid' });
chai.use(chaiDom);

const __ = mockTranslations({
    'chart-size': 'Size'
});

async function renderPreviewResizer({ chart, team, theme, visualization }) {
    chart = storeWithSetKey(chart);

    const result = await renderWithContext(
        PreviewResizer,
        {
            __,
            uid: 'resizer'
        },
        {
            // mock page/edit context
            'page/edit': {
                chart,
                team,
                theme,
                visualization: visualization || lineChart
            }
        }
    );
    return { ...result, updateChart: chart.setKey };
}

const baseChart = {
    metadata: {
        publish: {
            'embed-width': 550,
            'embed-height': 420
        }
    }
};

const lineChart = readable({});
const barChart = readable({ height: 'fixed' });

describe('PreviewResizer', () => {
    let result;

    describe('web mode', () => {
        describe('with defaults', () => {
            beforeEach(async () => {
                const chart = writable(cloneDeep(baseChart));
                const team = readable({ settings: {} });
                const theme = readable({ data: {} });
                result = await renderPreviewResizer({
                    chart,
                    team,
                    theme
                });
            });

            it('shows inputs for width and height', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (px)')).to.exist;
                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.exist;
                expect(inputs[0]).to.have.value('550');
                expect(inputs[1]).to.exist;
                expect(inputs[1]).to.have.value('420');
            });

            it('shows buttons for preview sizes', () => {
                const toolbar = result.getByTestId('resizer');
                const buttons = toolbar.querySelectorAll('button');
                expect(buttons).to.have.length(3);
                expect(buttons[0]).not.to.have.class('is-selected');
                expect(buttons[1]).not.to.have.class('is-selected');
                expect(buttons[2]).to.have.class('is-selected');
            });

            it('clicking button updates preview size', async () => {
                const toolbar = result.getByTestId('resizer');
                const buttons = toolbar.querySelectorAll('button');
                await clickOn(buttons[0]);
                expect(buttons[0]).to.have.class('is-selected');
                // check if embed-width changed
                const { publish } = getStoreValue(result.stores['page/edit'].chart).metadata;
                expect(publish).to.have.property('embed-width', 320);
                expect(publish).to.have.property('embed-height', 420);
                await clickOn(buttons[2]);
                const { publish: publish2 } = getStoreValue(
                    result.stores['page/edit'].chart
                ).metadata;
                expect(publish2).to.have.property('embed-width', 600);
                expect(publish2).to.have.property('embed-height', 420);
            });
        });

        describe('with fixed height chart', () => {
            beforeEach(async () => {
                const chart = writable(cloneDeep(baseChart));
                const team = readable({ settings: {} });
                const theme = readable({ data: {} });
                result = await renderPreviewResizer({
                    chart,
                    team,
                    theme,
                    visualization: barChart
                });
            });

            it('shows number input for width, but not for height', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (px)')).to.exist;
                expect(result.queryByText('Size (mm)')).not.to.exist;
                const inputs = toolbar.querySelectorAll('input');
                expect(inputs).to.have.length(2);
                expect(inputs[0]).to.have.attribute('type', 'number');
                expect(inputs[0]).to.have.value('550');
                expect(inputs[1]).to.have.attribute('type', 'text');
                expect(inputs[1]).to.have.attribute('disabled');
                expect(inputs[1]).to.have.value('auto');
            });
        });

        describe('with custom preview breakpoints', () => {
            beforeEach(async () => {
                const chart = writable(cloneDeep(baseChart));
                const team = readable({ settings: { previewWidths: [380, 580, 780] } });
                const theme = readable({ data: {} });

                result = await renderPreviewResizer({
                    chart,
                    team,
                    theme
                });
            });

            it('second breakpoint is pre-selected', async () => {
                const toolbar = result.getByTestId('resizer');
                const buttons = toolbar.querySelectorAll('button');
                expect(buttons).to.have.length(3);
                expect(buttons[0]).not.to.have.class('is-selected');
                expect(buttons[1]).to.have.class('is-selected');
                expect(buttons[2]).not.to.have.class('is-selected');
            });

            it('clicking button updates preview size', async () => {
                const toolbar = result.getByTestId('resizer');
                const buttons = toolbar.querySelectorAll('button');
                await clickOn(buttons[0]);
                expect(buttons[0]).to.have.class('is-selected');
                // check if embed-width changed
                const { publish } = getStoreValue(result.stores['page/edit'].chart).metadata;
                expect(publish).to.have.property('embed-width', 380);
                await clickOn(buttons[2]);
                const { publish: publish2 } = getStoreValue(
                    result.stores['page/edit'].chart
                ).metadata;
                expect(publish2).to.have.property('embed-width', 780);
            });
        });

        describe('with incomplete custom preview breakpoints', () => {
            beforeEach(async () => {
                const chart = writable(cloneDeep(baseChart));
                const team = readable({ settings: { previewWidths: [null, 480, null] } });
                const theme = readable({ data: {} });

                result = await renderPreviewResizer({
                    chart,
                    team,
                    theme
                });
            });

            it('clicking buttons sets correct preview size', async () => {
                const toolbar = result.getByTestId('resizer');
                const buttons = toolbar.querySelectorAll('button');

                // check if embed-width changed
                await clickOn(buttons[0]);
                const { publish } = getStoreValue(result.stores['page/edit'].chart).metadata;
                expect(publish).to.have.property('embed-width', 320);
                // check second button
                await clickOn(buttons[1]);
                const { publish: publish2 } = getStoreValue(
                    result.stores['page/edit'].chart
                ).metadata;
                expect(publish2).to.have.property('embed-width', 480);
                // check third button
                await clickOn(buttons[2]);
                const { publish: publish3 } = getStoreValue(
                    result.stores['page/edit'].chart
                ).metadata;
                expect(publish3).to.have.property('embed-width', 600);
            });
        });

        describe('with preview breakpoints in wrong order', () => {
            beforeEach(async () => {
                const chart = writable(cloneDeep(baseChart));
                const team = readable({ settings: { previewWidths: [700, 250, null] } });
                const theme = readable({ data: {} });

                result = await renderPreviewResizer({
                    chart,
                    team,
                    theme
                });
            });

            it('clicking buttons sets correct preview size', async () => {
                const toolbar = result.getByTestId('resizer');
                const buttons = toolbar.querySelectorAll('button');

                // check if embed-width changed
                await clickOn(buttons[0]);
                const { publish } = getStoreValue(result.stores['page/edit'].chart).metadata;
                expect(publish).to.have.property('embed-width', 250);
                // check second button
                await clickOn(buttons[1]);
                const { publish: publish2 } = getStoreValue(
                    result.stores['page/edit'].chart
                ).metadata;
                expect(publish2).to.have.property('embed-width', 600);
                // check third button
                await clickOn(buttons[2]);
                const { publish: publish3 } = getStoreValue(
                    result.stores['page/edit'].chart
                ).metadata;
                expect(publish3).to.have.property('embed-width', 700);
            });
        });
    });

    describe('print mode', () => {
        describe('through theme', () => {
            beforeEach(async () => {
                const chart = writable(cloneDeep(baseChart));
                const team = readable({ settings: {} });
                const theme = readable({ data: { type: 'print' } });
                result = await renderPreviewResizer({
                    chart,
                    team,
                    theme
                });
            });

            it('shows inputs for width and height with correct unit', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (mm)')).to.exist;
                expect(result.queryByText('Size (px)')).not.to.exist;
                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.have.value(((550 * 25.4) / 96).toFixed());
                expect(inputs[1]).to.have.value(((420 * 25.4) / 96).toFixed());
            });

            it('shows dropdown button, but no print options', () => {
                const toolbar = result.getByTestId('resizer');
                const buttons = toolbar.querySelectorAll('button');
                expect(buttons).to.have.length(1);
                const printOptions = toolbar.querySelector('.print-options');
                expect(printOptions).not.to.exist;
            });

            it('clicking dropdown button reveals print options', async () => {
                const toolbar = result.getByTestId('resizer');
                const dropdownToggle = toolbar.querySelector('button');
                await clickOn(dropdownToggle);
                const printOptions = toolbar.querySelector('.print-options');
                expect(printOptions).to.exist;
            });

            it('changing the unit changes the title and inputs', async () => {
                const toolbar = result.getByTestId('resizer');
                const dropdownToggle = toolbar.querySelector('button');
                await clickOn(dropdownToggle);
                const unitRadioOptions = toolbar.querySelectorAll('.print-options label.radio');
                expect(unitRadioOptions).to.have.length(3);
                await clickOn(unitRadioOptions[1]); // inch
                expect(result.queryByText('Size (in)')).to.exist;
                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.have.value((550 / 96).toFixed(2));
                expect(inputs[1]).to.have.value((420 / 96).toFixed(2));
            });

            it('changing iframe chart size updates inputs with units', async () => {
                const toolbar = result.getByTestId('resizer');
                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.have.value(((550 * 25.4) / 96).toFixed());
                expect(inputs[1]).to.have.value(((420 * 25.4) / 96).toFixed());
                // get chart store
                const { chart } = result.stores['page/edit'];
                expect(chart).to.exist;
                // set pixel width in chart store (i.e. iframe gets resized)
                chart.setKey('metadata.publish.embed-width', 700);
                chart.setKey('metadata.publish.embed-height', 300);
                await tick();
                expect(inputs[0]).to.have.value(((700 * 25.4) / 96).toFixed());
                expect(inputs[1]).to.have.value(((300 * 25.4) / 96).toFixed());
            });

            it('changing inputs with units updates chart size in pixels', async () => {
                const toolbar = result.getByTestId('resizer');
                const inputs = toolbar.querySelectorAll('input[type=number]');
                await changeValueTo(inputs[0], 100); // 100mm
                await changeValueTo(inputs[1], 80); // 80mm
                await tick();
                // get chart store
                const { chart } = result.stores['page/edit'];
                const { publish } = getStoreValue(chart).metadata;
                expect(publish).to.have.property('embed-width', Math.round((100 * 96) / 25.4));
                expect(publish).to.have.property('embed-height', Math.round((80 * 96) / 25.4));
            });
        });

        describe('through theme, with custom pdf export scale', () => {
            beforeEach(async () => {
                const chart = writable(cloneDeep(baseChart));
                const team = readable({ settings: {} });
                const theme = readable({
                    data: { type: 'print', export: { pdf: { scale: 1.5 } } }
                });
                result = await renderPreviewResizer({
                    chart,
                    team,
                    theme
                });
            });

            it('shows inputs for width and height with correct unit', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (mm)')).to.exist;
                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.have.value((((550 * 25.4) / 96) * 1.5).toFixed());
                expect(inputs[1]).to.have.value((((420 * 25.4) / 96) * 1.5).toFixed());
            });
        });

        describe('through theme, with custom pdf export presets', () => {
            beforeEach(async () => {
                const chart = writable(cloneDeep(baseChart));
                const team = readable({ settings: {} });
                const theme = readable({
                    data: {
                        type: 'print',
                        export: {
                            pdf: {
                                presets: [
                                    { title: '10in', width: 10, unit: 'in' },
                                    { title: 'A5', width: 148, height: 210, unit: 'mm' },
                                    { title: 'A6', width: 105, height: 148, unit: 'mm' }
                                ]
                            }
                        }
                    }
                });
                result = await renderPreviewResizer({
                    chart,
                    team,
                    theme
                });
            });

            it('shows select with presets', async () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                const dropdownToggle = toolbar.querySelector('button');
                await clickOn(dropdownToggle);
                const select = toolbar.querySelector('.print-options select');
                expect(select).to.exist;
                const options = toolbar.querySelectorAll('.print-options select option');
                expect(options).to.have.length(3 + 1); // +1 for the placeholder
            });
        });

        describe('through chart', () => {
            beforeEach(async () => {
                const chart = writable(
                    assign(cloneDeep(baseChart), {
                        metadata: {
                            custom: {
                                webToPrint: {
                                    mode: 'print'
                                }
                            }
                        }
                    })
                );
                const team = readable({ settings: {} });
                const theme = readable({ data: {} });
                result = await renderPreviewResizer({
                    chart,
                    team,
                    theme
                });
            });

            it('shows inputs for width and height with correct unit', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (mm)')).to.exist;
                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.have.value(((550 * 25.4) / 96).toFixed());
                expect(inputs[1]).to.have.value(((420 * 25.4) / 96).toFixed());
                const buttons = toolbar.querySelectorAll('button');
                expect(buttons).to.have.length(1);
            });
        });
    });
});
