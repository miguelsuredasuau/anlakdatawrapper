import ChartTypeTab from './ChartTypeTab.svelte';
import { writable } from 'svelte/store';
import { fireEvent, waitFor } from '@testing-library/svelte';
import {
    renderWithContext,
    setConfig,
    trackStoreChanges,
    mockTranslations
} from '../../../../../test/helpers/clientUtils';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import sinonChai from 'sinon-chai';

import sinon from 'sinon';

setConfig({ testIdAttribute: 'data-uid' });

chai.use(chaiDom);
chai.use(sinonChai);

const __ = mockTranslations({
    'bar-chart': 'Bar chart',
    'visualize / transpose-button': 'transpose'
});

const visualizations = [
    {
        id: 'hidden',
        workflow: 'chart'
    },
    {
        id: 'd3-lines',
        title: 'Line chart',
        workflow: 'chart'
    },
    {
        id: 'd3-bars',
        title: 'bar-chart',
        workflow: 'chart'
    },
    {
        id: 'd3-choropleth-maps',
        title: 'Choropleth map',
        workflow: 'd3-maps'
    }
];

const baseChart = {
    type: 'd3-lines',
    metadata: {
        data: {
            transpose: false
        }
    }
};

function renderChartTypeTab({ chart, visualization, visualizations, workflow }) {
    return renderWithContext(
        ChartTypeTab,
        {
            visualizations,
            workflow,
            __
        },
        {
            // mock page/edit context
            'page/edit': {
                chart,
                visualization
            }
        }
    );
}

describe('ChartTypeTab', () => {
    describe('initial display', function () {
        let result;

        const chart = writable(baseChart);
        const visualization = writable({
            id: 'd3-lines'
        });

        beforeEach(async () => {
            result = await renderChartTypeTab({
                chart,
                visualization,
                visualizations,
                workflow: { id: 'chart', options: {} }
            });
        });

        it('shows correct vis buttons', () => {
            const buttons = result.getAllByTestId('vis-type-button');
            expect(buttons).to.have.length(2);
            expect(result.queryByText('Line chart')).to.exist;
            expect(result.queryByText('Line chart').parentNode.parentNode).to.have.class('active');
            expect(result.queryByText('Bar chart')).to.exist;
            expect(result.queryByText('Choropleth map')).not.to.exist;
        });

        it('shows transpose button', () => {
            const button = result.queryByText('transpose');
            expect(button).to.exist;
        });
    });

    describe('include visualizations from other workflows', function () {
        let result;

        const chart = writable(baseChart);
        const visualization = writable({
            id: 'd3-lines'
        });

        beforeEach(async () => {
            result = await renderChartTypeTab({
                chart,
                visualization,
                visualizations: [
                    ...visualizations,
                    {
                        id: 'tables',
                        title: 'Table',
                        workflow: 'tables',
                        includeInWorkflow: 'chart'
                    }
                ],
                workflow: { id: 'chart', options: {} }
            });
        });

        it('shows correct vis buttons', () => {
            const buttons = result.getAllByTestId('vis-type-button');
            expect(buttons).to.have.length(3);
            expect(result.queryByText('Line chart')).to.exist;
            expect(result.queryByText('Bar chart')).to.exist;
            expect(result.queryByText('Table')).to.exist;
            expect(result.queryByText('Choropleth map')).not.to.exist;
        });
    });

    describe('include visualizations from other workflows (reverse)', function () {
        let result;

        const chart = writable(baseChart);
        const visualization = writable({
            id: 'd3-lines'
        });

        beforeEach(async () => {
            result = await renderChartTypeTab({
                chart,
                visualization,
                visualizations: [
                    ...visualizations,
                    {
                        id: 'tables',
                        title: 'Table',
                        workflow: 'tables'
                    }
                ],
                workflow: {
                    id: 'tables',
                    options: {
                        includeInChartTypeSelector: ['chart']
                    }
                }
            });
        });

        it('shows correct vis buttons', () => {
            const buttons = result.getAllByTestId('vis-type-button');
            expect(buttons).to.have.length(3);
            expect(result.queryByText('Line chart')).to.exist;
            expect(result.queryByText('Bar chart')).to.exist;
            expect(result.queryByText('Table')).to.exist;
            expect(result.queryByText('Choropleth map')).not.to.exist;
        });
    });

    describe('when vis button gets clicked', function () {
        let result, chartWatcher, visWatcher;

        beforeEach(async () => {
            const chart = writable(baseChart);
            const visualization = writable({
                id: 'd3-lines'
            });
            result = await renderChartTypeTab({
                chart,
                visualization,
                visualizations,
                workflow: {
                    id: 'chart'
                },
                __
            });

            trackStoreChanges(chart, (chartWatcher = sinon.spy()));
            trackStoreChanges(visualization, (visWatcher = sinon.spy()));
        });

        it('fires chart and vis store change', async () => {
            const barChartButton = result.getByText('Bar chart');
            await fireEvent(barChartButton, new MouseEvent('click', { bubbles: true }));

            expect(chartWatcher).to.have.been.calledOnceWith({ type: 'd3-bars' });
            waitFor(() => expect(visWatcher).to.have.been.calledOnceWith(visualizations[2]));
        });
    });

    describe('when transpose button gets clicked', function () {
        let result, chartWatcher;

        beforeEach(async () => {
            const chart = writable(baseChart);

            result = await renderChartTypeTab({
                chart,
                visualization: writable({
                    id: 'd3-lines'
                }),
                visualizations,
                workflow: {
                    id: 'chart'
                }
            });

            trackStoreChanges(chart, (chartWatcher = sinon.spy()));
        });

        it('fires chart store changes', async () => {
            const transposeButton = result.getByText('transpose');
            await fireEvent(transposeButton, new MouseEvent('click', { bubbles: true }));

            expect(chartWatcher).to.have.been.calledOnceWith({
                metadata: { data: { transpose: true } }
            });

            await fireEvent(transposeButton, new MouseEvent('click', { bubbles: true }));

            expect(chartWatcher).to.have.been.calledTwice;

            expect(chartWatcher).to.have.been.calledWith({
                metadata: { data: { transpose: false } }
            });
        });
    });
});
