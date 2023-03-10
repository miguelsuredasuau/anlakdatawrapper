import PreviewResizer from './PreviewResizer.svelte';
import { tick } from 'svelte';
import { get as getStoreValue } from 'svelte/store';
import {
    renderWithContext,
    setConfig,
    mockTranslations,
    clickOn,
    fireChangeEvent,
    changeValueTo
} from '../../../../tests/helpers/clientUtils';
import chai, { expect } from 'chai';
import { cloneDeep } from 'lodash';
import assign from 'assign-deep';
import chaiDom from 'chai-dom';
import sinonChai from 'sinon-chai';
import { initStores } from '../../edit/stores.js';
import { take, tap } from 'rxjs/operators';
import set from 'lodash/set';
import nock from 'nock';

setConfig({ testIdAttribute: 'data-uid' });
chai.use(chaiDom);
chai.use(sinonChai);

const __ = mockTranslations({
    'chart-size': 'Size'
});

const pxToInch = px => px / 96;
const pxToMM = px => (px / 96) * 25.4;
const inchToPx = inch => Math.round(inch * 96);
const mmToPx = mm => Math.round((mm * 96) / 25.4);

async function renderPreviewResizer({
    rawChart,
    rawTeam,
    rawTheme,
    rawVisualizations = [lineChart]
}) {
    const { chart, theme, isFixedHeight, team, editorMode, visualization } = initStores({
        rawChart,
        rawTheme,
        rawTeam,
        rawVisualizations,
        rawReadonlyKeys: []
    });
    const iframe = document.createElement('div');

    const triggerFixedHeightChange = height => {
        isFixedHeight
            .pipe(
                take(1),
                tap(isFixedHeight => {
                    if (!isFixedHeight) return;
                    const event = new CustomEvent('fixed-height-changed', { detail: height });
                    iframe.dispatchEvent(event);
                })
            )
            .subscribe();
    };

    const iframePreview = (function () {
        let dimensions = { width: null, height: null };
        return {
            set(d) {
                dimensions = d;
            },
            $on: (event, cb) => iframe.addEventListener(event, cb),
            get dimensions() {
                return dimensions;
            }
        };
    })();

    chart.setKey = (key, value) => {
        const prev = cloneDeep(chart._value);
        set(prev, key, value);
        chart.set(prev);
    };

    const result = await renderWithContext(
        PreviewResizer,
        {
            __,
            uid: 'resizer',
            iframePreview
        },
        {
            // mock page/edit context
            'page/edit': {
                chart,
                team,
                theme,
                visualization,
                editorMode,
                isFixedHeight
            }
        }
    );
    return { ...result, updateChart: chart.setKey, iframePreview, triggerFixedHeightChange };
}

const baseChart = {
    metadata: {
        publish: {
            'embed-width': 550,
            'embed-height': 420,
            'export-pdf': {}
        }
    }
};
const basePrintChart = assign(cloneDeep(baseChart), {
    metadata: {
        publish: {
            'export-pdf': {
                colorMode: 'cmyk',
                width: 80,
                height: 120,
                unit: 'mm'
            }
        }
    }
});

const lineChart = {};
const barChart = { height: 'fixed' };
const pieChart = { height: 'fixed', supportsFitHeight: true };

const webTheme = { data: {} };
const printTheme = { data: { type: 'print' } };

const presets = {
    A5mm: {
        title: 'A5',
        width: 148,
        height: 210,
        unit: 'mm',
        default: true
    }
};

describe('PreviewResizer', () => {
    let result;

    beforeEach(() => {
        window.dw = {
            backend: {
                __api_domain: 'http://api.datawrapper.mock'
            }
        };
        nock('http://api.datawrapper.mock').patch('/v3/charts/undefined').reply(200);
    });

    describe('web mode', () => {
        describe('with defaults', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: {} };
                const rawTheme = webTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
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

            it('sets correct preview size', async () => {
                await sleep(100);
                expect(result.iframePreview.dimensions).to.deep.equal({
                    width: 550,
                    height: 420
                });
            });

            it('clicking button updates preview size', async () => {
                const toolbar = result.getByTestId('resizer');
                const preview = result.iframePreview;
                const buttons = toolbar.querySelectorAll('button');
                await clickOn(buttons[0]);
                expect(buttons[0]).to.have.class('is-selected');
                // check if embed-width changed
                const { publish } = result.stores['page/edit'].chart._value.metadata;
                expect(publish).to.have.property('embed-width', 320);
                expect(publish).to.have.property('embed-height', 420);
                await sleep(100);
                expect(preview.dimensions).to.deep.equal({
                    width: 320,
                    height: 420
                });
                await clickOn(buttons[2]);
                const { publish: publish2 } = result.stores['page/edit'].chart._value.metadata;
                expect(publish2).to.have.property('embed-width', 600);
                expect(publish2).to.have.property('embed-height', 420);
                await sleep(100);
                expect(preview.dimensions).to.deep.equal({
                    width: 600,
                    height: 420
                });
            });
        });

        describe('with fixed height chart', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: {} };
                const rawTheme = webTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme,
                    rawVisualizations: [barChart]
                });
            });

            it('shows number input for width, but not for height', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (px)')).to.exist;
                expect(result.queryByText('Size (mm)')).not.to.exist;

                expect(result.queryByTestId('web-width')).to.exist;
                expect(result.queryByTestId('web-height')).not.to.exist;

                const controls = toolbar.querySelectorAll('.number-input');
                expect(controls).to.have.length(2);

                expect(controls[0]).to.have.attribute('data-uid', 'web-width');
                expect(controls[1]).not.to.have.attribute('data-uid', 'web-height');

                const inputHeight = controls[1].querySelector('input[type=text]');
                expect(inputHeight).to.have.attribute('disabled');
                expect(inputHeight).to.have.value('auto');
            });

            it('embed-height updated when iframe resize event fired', () => {
                const toolbar = result.getByTestId('resizer');
                result.triggerFixedHeightChange(500);
                const { publish } = result.stores['page/edit'].chart._value.metadata;
                expect(publish).to.have.property('embed-height', 500);

                const inputWidth = toolbar.querySelector(
                    '.number-input[data-uid=web-width] input[type=number]'
                );
                expect(inputWidth).to.exist;
                expect(inputWidth).to.have.value('550');

                expect(result.queryByTestId('web-height')).not.to.exist;
            });
        });

        describe('with fixed height chart that supports fitHeight', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: {} };
                const rawTheme = webTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme,
                    rawVisualizations: [pieChart]
                });
            });

            it('supportsFitHeight is ignored', () => {
                expect(result.queryByTestId('web-width')).to.exist;
                expect(result.queryByTestId('web-height')).not.to.exist;
            });
        });

        describe('switch from fit to fixed', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: {} };
                const rawTheme = webTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme,
                    rawVisualizations: [{}, { id: 'fixed-height-chart', height: 'fixed' }]
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

            it('sets correct preview size', async () => {
                await sleep(100);
                expect(result.iframePreview.dimensions).to.deep.equal({
                    width: 550,
                    height: 420
                });
            });

            describe('change visualization to fixed height', () => {
                beforeEach(async () => {
                    result.updateChart('type', 'fixed-height-chart');
                    await tick();
                });

                it('sets correct preview size', async () => {
                    await sleep(100);
                    expect(result.iframePreview.dimensions).to.deep.equal({
                        width: 550,
                        height: null
                    });
                });
            });
        });

        describe('with custom preview breakpoints', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: { previewWidths: [380, 580, 780] } };
                const rawTheme = webTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
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
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: { previewWidths: [null, 480, null] } };
                const rawTheme = webTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
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
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: { previewWidths: [700, 250, null] } };
                const rawTheme = webTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
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
        describe('through print theme', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(basePrintChart);
                const rawTeam = { settings: {} };
                const rawTheme = printTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
                });
            });

            it('shows inputs for width and height with correct unit', async () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (mm)')).to.exist;
                expect(result.queryByText('Size (px)')).not.to.exist;
                await tick();

                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.have.value('80');
                expect(inputs[1]).to.have.value('120');
                await sleep(100);
                expect(result.iframePreview.dimensions).to.deep.equal({
                    width: mmToPx(80),
                    height: mmToPx(120)
                });
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
                await tick();
                const { chart } = result.stores['page/edit'];
                const pdfMeta = getStoreValue(chart).metadata.publish['export-pdf'];
                expect(pdfMeta).to.have.property('unit', 'in');
                const [pxWidth, pxHeight] = [80, 120].map(mmToPx);
                expect(result.queryByText('Size (in)')).to.exist;
                expect(pdfMeta).to.have.property('width', +pxToInch(pxWidth).toFixed(2));
                expect(pdfMeta).to.have.property('height', +pxToInch(pxHeight).toFixed(2));

                // const inputs = toolbar.querySelectorAll('input[type=number]');

                // expect(inputs[0]).to.have.value(pxToInch(pxWidth).toFixed(2));
                // expect(inputs[1]).to.have.value(pxToInch(pxHeight).toFixed(2));
            });

            it('changing inputs with units updates chart size export-pdf meta, leaves embed size unchanged', async () => {
                const toolbar = result.getByTestId('resizer');
                const inputs = toolbar.querySelectorAll('input[type=number]');
                await changeValueTo(inputs[0], 100); // 100mm
                await changeValueTo(inputs[1], 80); // 80mm
                await tick();
                // get chart store
                const { chart } = result.stores['page/edit'];
                const publishMeta = getStoreValue(chart).metadata.publish;
                const pdfMeta = publishMeta['export-pdf'];
                expect(pdfMeta).to.have.property('width', 100);
                expect(pdfMeta).to.have.property('height', 80);
                expect(publishMeta).to.have.property('embed-width', 550);
                expect(publishMeta).to.have.property('embed-height', 420);
            });

            it('pre-existing properties are kept in metadata', () => {
                const { chart } = result.stores['page/edit'];
                const publishMeta = getStoreValue(chart).metadata.publish;
                const pdfMeta = publishMeta['export-pdf'];
                expect(pdfMeta).to.have.property('colorMode', 'cmyk');
            });
        });

        describe('through print theme, with custom pdf export scale', () => {
            const scale = 1.5;

            beforeEach(async () => {
                const rawChart = cloneDeep(basePrintChart);
                const rawTeam = { settings: {} };
                const rawTheme = {
                    data: { type: 'print', export: { pdf: { scale } } }
                };
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
                });
            });

            it('shows inputs for width and height with unscaled unit', () => {
                const toolbar = result.getByTestId('resizer');
                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.have.value('80');
                expect(inputs[1]).to.have.value('120');
            });

            it('preview iframe is scaled', async () => {
                await sleep(100);
                expect(result.iframePreview.dimensions).to.deep.equal({
                    width: mmToPx(80 / scale),
                    height: mmToPx(120 / scale)
                });
            });
        });

        describe('through theme, with custom pdf export presets', () => {
            const preset = {
                title: '10 inch',
                width: 10,
                unit: 'in',
                include: 'plain',
                scale: 0.8
            };
            beforeEach(async () => {
                const rawChart = cloneDeep(basePrintChart);
                const rawTeam = { settings: {} };
                const rawTheme = {
                    data: {
                        type: 'print',
                        export: {
                            pdf: {
                                presets: [
                                    preset,
                                    { title: 'A5', width: 148, height: 210, unit: 'mm' },
                                    { title: 'A6', width: 105, height: 148, unit: 'mm' }
                                ]
                            }
                        }
                    }
                };
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
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

            it('size inputs show correct value before applying preset', () => {
                const toolbar = result.getByTestId('resizer');
                const inputs = toolbar.querySelectorAll('input[type=number]');

                expect(result.queryByText('Size (mm)')).to.exist;
                expect(inputs[0]).to.have.value('80');
                expect(inputs[1]).to.have.value('120');
            });

            describe('after presets are applied', () => {
                beforeEach(async () => {
                    const toolbar = result.getByTestId('resizer');
                    const dropdownToggle = toolbar.querySelector('button');

                    await clickOn(dropdownToggle);
                    const select = toolbar.querySelector('.print-options select');
                    select.selectedIndex = 1;
                    fireChangeEvent(select);
                    await tick();
                });

                it('preset attributes are copied as well', () => {
                    const { chart } = result.stores['page/edit'];
                    const publishMeta = getStoreValue(chart).metadata.publish;
                    const pdfMeta = publishMeta['export-pdf'];
                    expect(pdfMeta).to.have.property('width', preset.width);
                    // height is unchanged
                    expect(pdfMeta).to.have.property('height', +pxToInch(mmToPx(120)).toFixed(2));
                    expect(pdfMeta).to.have.property('unit', preset.unit);
                    expect(pdfMeta).to.have.property('scale', preset.scale);
                    expect(pdfMeta).to.have.property('include', preset.include);
                    expect(pdfMeta).not.to.have.property('title');
                });

                it('pre-existing properties are kept in metadata', () => {
                    const { chart } = result.stores['page/edit'];
                    const publishMeta = getStoreValue(chart).metadata.publish;
                    const pdfMeta = publishMeta['export-pdf'];
                    expect(pdfMeta).to.have.property('colorMode', 'cmyk');
                });

                it('missing dimensions are converted', () => {
                    const toolbar = result.getByTestId('resizer');
                    const inputs = toolbar.querySelectorAll('input[type=number]');
                    expect(result.queryByText('Size (in)')).to.exist;
                    expect(inputs[0]).to.have.value('10');
                    expect(inputs[1]).to.have.value(pxToInch(mmToPx(120)).toFixed(2));
                });

                it('preview size is updated correctly', async () => {
                    await sleep(200);
                    expect(result.iframePreview.dimensions).to.deep.equal({
                        width: inchToPx(10),
                        height: inchToPx(pxToInch(mmToPx(120)))
                    });
                });
            });
        });

        describe('theme with default preset, fresh chart', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: {} };
                const rawTheme = {
                    data: {
                        type: 'print',
                        export: {
                            pdf: {
                                presets: [
                                    { title: '10in', width: 10, unit: 'in', default: true },
                                    { title: 'A5', width: 148, height: 210, unit: 'mm' },
                                    { title: 'A6', width: 105, height: 148, unit: 'mm' }
                                ]
                            }
                        }
                    }
                };
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
                });
            });

            it('dimensions from default preset get set automatically', async () => {
                const toolbar = result.getByTestId('resizer');
                const inputs = toolbar.querySelectorAll('input[type=number]');

                expect(result.queryByText('Size (in)')).to.exist;
                expect(inputs[0]).to.have.value('10');
                expect(inputs[1]).to.have.value(pxToInch(mmToPx(120)).toFixed(2));
            });
        });

        describe('through print chart', () => {
            beforeEach(async () => {
                const rawChart = assign(cloneDeep(baseChart), {
                    metadata: {
                        custom: {
                            webToPrint: {
                                mode: 'print'
                            }
                        }
                    }
                });
                const rawTeam = { settings: {} };
                const rawTheme = webTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
                });
            });

            it('shows inputs for width and height with correct unit', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (mm)')).to.exist;
                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.have.value('80');
                expect(inputs[1]).to.have.value('120');
                const buttons = toolbar.querySelectorAll('button');
                expect(buttons).to.have.length(1);
            });
        });

        describe('print theme, with fixed height vis', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: {} };
                const rawTheme = printTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme,
                    rawVisualizations: [barChart]
                });
            });

            it('shows number input for width, but not for height', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (mm)')).to.exist;
                expect(result.queryByTestId('print-width')).to.exist;
                expect(result.queryByTestId('print-height')).not.to.exist;
            });

            it('export-pdf.height updated when iframe resize event fired', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;

                result.triggerFixedHeightChange(500);
                const { publish } = getStoreValue(result.stores['page/edit'].chart).metadata;
                expect(publish['export-pdf']).to.have.property(
                    'height',
                    Number(pxToMM(500).toFixed())
                );

                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs[0]).to.have.value('80');
                expect(inputs[0]).not.to.have.attribute('disabled');
                expect(inputs[1]).to.have.attribute('disabled');
            });
        });

        describe('print theme, with fixed height vis that supports fitHeight', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: {} };
                const rawTheme = printTheme;
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme,
                    rawVisualizations: [pieChart]
                });
            });

            it('shows number inputs for width and height', () => {
                const toolbar = result.getByTestId('resizer');
                expect(toolbar).to.exist;
                expect(result.queryByText('Size (mm)')).to.exist;
                const inputs = toolbar.querySelectorAll('input[type=number]');
                expect(inputs).to.have.length(2);
                expect(inputs[0]).to.have.value('80');
                expect(inputs[0]).not.to.have.attribute('disabled');
                expect(inputs[1]).to.have.value('120');
                expect(inputs[1]).not.to.have.attribute('disabled');
            });
        });
    });

    describe('switch from web to print (through theme)', () => {
        describe('fresh web chart', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(baseChart);
                const rawTeam = { settings: {} };
                const rawTheme = { data: {} };
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
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

            it('sets correct size for iframe', async () => {
                await sleep(100);
                expect(result.iframePreview.dimensions).to.deep.equal({
                    width: 550,
                    height: 420
                });
            });

            describe('theme changes to print theme', () => {
                beforeEach(async () => {
                    nock('http://api.datawrapper.mock')
                        .get('/v3/themes/print-theme?extend=true')
                        .reply(200, {
                            data: {
                                type: 'print',
                                export: { pdf: { presets: [presets.A5mm] } }
                            }
                        });
                    result.updateChart('theme', 'print-theme');
                    await sleep(200);
                    await tick();
                });

                it('shows print mode inputs', () => {
                    const toolbar = result.getByTestId('resizer');
                    expect(toolbar).to.exist;
                    expect(result.queryByText('Size (mm)')).to.exist;
                });

                it('applies default export preset', () => {
                    const toolbar = result.getByTestId('resizer');
                    const inputs = toolbar.querySelectorAll('input[type=number]');
                    expect(inputs).to.have.length(2);
                    expect(inputs[0]).to.have.value('148');
                    expect(inputs[1]).to.have.value('210');
                });

                it('sets correct iframe size', async () => {
                    expect(result.iframePreview.dimensions).to.deep.equal({
                        width: mmToPx(148),
                        height: mmToPx(210)
                    });
                });
            });
        });

        describe('existing print chart', () => {
            beforeEach(async () => {
                const rawChart = cloneDeep(basePrintChart);
                const rawTeam = { settings: {} };
                const rawTheme = { data: {} };
                result = await renderPreviewResizer({
                    rawChart,
                    rawTeam,
                    rawTheme
                });
            });

            it('is in web mode', () => {
                expect(result.queryByText('Size (px)')).to.exist;
            });

            it('sets correct size for iframe', async () => {
                await sleep(100);
                expect(result.iframePreview.dimensions).to.deep.equal({
                    width: 550,
                    height: 420
                });
            });

            describe('theme changes to print theme', () => {
                beforeEach(async () => {
                    await sleep(100); // wait for initial iframePreview.set
                    nock('http://api.datawrapper.mock')
                        .get('/v3/themes/print-theme?extend=true')
                        .reply(200, {
                            data: {
                                type: 'print',
                                export: { pdf: { presets: [presets.A5mm] } }
                            }
                        });
                    result.updateChart('theme', 'print-theme');
                    await sleep(150);
                    await tick();
                });

                it('shows print mode inputs', () => {
                    const toolbar = result.getByTestId('resizer');
                    expect(toolbar).to.exist;
                    expect(result.queryByText('Size (mm)')).to.exist;
                });

                it('uses print size from metadata', () => {
                    const toolbar = result.getByTestId('resizer');
                    const inputs = toolbar.querySelectorAll('input[type=number]');
                    expect(inputs).to.have.length(2);
                    expect(inputs[0]).to.have.value('80');
                    expect(inputs[1]).to.have.value('120');
                });

                it('sets correct iframe size', () => {
                    expect(result.iframePreview.dimensions).to.deep.equal({
                        width: mmToPx(80),
                        height: mmToPx(120)
                    });
                });

                describe('switch back to web theme', () => {
                    beforeEach(async () => {
                        nock('http://api.datawrapper.mock')
                            .get('/v3/themes/default-theme?extend=true')
                            .reply(200, { data: {} });
                        result.updateChart('theme', 'default-theme');
                        await sleep(150);
                        await tick();
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

                    it('sets correct iframe size', () => {
                        expect(result.iframePreview.dimensions).to.deep.equal({
                            width: 550,
                            height: 420
                        });
                    });
                });
            });
        });
    });
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
