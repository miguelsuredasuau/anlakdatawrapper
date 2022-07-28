import { initStores } from './stores';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import nock from 'nock';
import FakeTimers from '@sinonjs/fake-timers';
import sinon from 'sinon';
import { tap } from 'rxjs/operators';
import { subscribeOnce } from '../../../test/helpers/clientUtils';

const rawChart = {
    publicId: 'rBHpV',
    language: 'en-US',
    theme: 'datawrapper',
    id: 'rBHpV',
    type: 'd3-lines',
    title: 'Test',
    lastEditStep: 3,
    publishedAt: null,
    publicUrl: null,
    publicVersion: 0,
    deleted: false,
    deletedAt: null,
    forkable: false,
    isFork: false,
    metadata: {
        data: {
            changes: [],
            transpose: false,
            'vertical-header': true,
            'horizontal-header': true
        },
        describe: {
            'source-name': 'Apple',
            'source-url': 'https://www.apple.com/newsroom/',
            intro: 'Apple sales by product in shipped units, 2000 to 2017.',
            byline: '',
            'aria-description': '',
            'number-format': '-',
            'number-divisor': 0,
            'number-append': '',
            'number-prepend': '',
            'hide-title': false
        },
        visualize: {
            'dark-mode-invert': true,
            'highlighted-series': [],
            'highlighted-values': [],
            sharing: {
                enabled: false,
                auto: true
            },
            rules: false,
            thick: false,
            'x-grid': 'off',
            'y-grid': 'on',
            'scale-y': 'linear',
            labeling: 'right',
            overlays: [],
            'sort-bars': false,
            background: false,
            'base-color': 0,
            'force-grid': false,
            'sort-areas': 'keep',
            'line-dashes': {},
            'line-widths': {},
            'stack-areas': true,
            'swap-labels': false,
            'area-opacity': 0.5,
            'block-labels': false,
            'custom-range': ['', ''],
            'label-colors': false,
            'label-margin': 0,
            'line-symbols': false,
            'range-extent': 'nice',
            'stack-to-100': false,
            'thick-arrows': false,
            'custom-colors': {},
            interpolation: 'linear',
            'reverse-order': false,
            'show-tooltips': true,
            'tick-position': 'top',
            'x-tick-format': 'auto',
            'y-grid-format': 'auto',
            'y-grid-labels': 'inside',
            'chart-type-set': true,
            'color-category': {
                map: {},
                categoryOrder: [
                    '2000 Q3',
                    '2000 Q4',
                    '2001 Q1',
                    '2001 Q2',
                    '2001 Q3',
                    '2001 Q4',
                    '2002 Q1',
                    '2002 Q2',
                    '2002 Q3',
                    '2002 Q4',
                    '2003 Q1',
                    '2003 Q2',
                    '2003 Q3',
                    '2003 Q4',
                    '2004 Q1',
                    '2004 Q2',
                    '2004 Q3',
                    '2004 Q4',
                    '2005 Q1',
                    '2005 Q2',
                    '2005 Q3',
                    '2005 Q4',
                    '2006 Q1',
                    '2006 Q2',
                    '2006 Q3',
                    '2006 Q4',
                    '2007 Q1',
                    '2007 Q2',
                    '2007 Q3',
                    '2007 Q4',
                    '2008 Q1',
                    '2008 Q2',
                    '2008 Q3',
                    '2008 Q4',
                    '2009 Q1',
                    '2009 Q2',
                    '2009 Q3',
                    '2009 Q4',
                    '2010 Q1',
                    '2010 Q2',
                    '2010 Q3',
                    '2010 Q4',
                    '2011 Q1',
                    '2011 Q2',
                    '2011 Q3',
                    '2011 Q4',
                    '2012 Q1',
                    '2012 Q2',
                    '2012 Q3',
                    '2012 Q4',
                    '2013 Q1',
                    '2013 Q2',
                    '2013 Q3',
                    '2013 Q4',
                    '2014 Q1',
                    '2014 Q2',
                    '2014 Q3',
                    '2014 Q4',
                    '2015 Q1',
                    '2015 Q2',
                    '2015 Q3',
                    '2015 Q4',
                    '2016 Q1',
                    '2016 Q2',
                    '2016 Q3',
                    '2016 Q4',
                    '2017 Q1',
                    '2017 Q2',
                    '2017 Q3',
                    '2017 Q4',
                    '2018 Q1',
                    '2018 Q2',
                    '2018 Q3',
                    '2018 Q4',
                    '2019 Q1',
                    '2019 Q2',
                    '2019 Q3',
                    '2019 Q4',
                    '2020 Q1',
                    '2020 Q2',
                    '2020 Q3',
                    '2020 Q4',
                    '2021 Q1',
                    '2021 Q2',
                    '2021 Q3',
                    '2021 Q4'
                ],
                categoryLabels: {},
                excludeFromKey: []
            },
            'custom-range-x': ['', ''],
            'custom-range-y': ['', ''],
            'custom-ticks-x': '',
            'custom-ticks-y': '',
            'show-color-key': false,
            'color-by-column': false,
            'connector-lines': true,
            'group-by-column': false,
            'label-alignment': 'left',
            'line-symbols-on': 'both',
            'value-label-row': false,
            'text-annotations': [
                {
                    x: '2006/03/09 12:33',
                    y: '101.0325',
                    bg: false,
                    dx: 0,
                    dy: 0,
                    bold: false,
                    size: 14,
                    text: 'Type your annotation text here',
                    align: 'tl',
                    color: false,
                    width: 29.773960216998212,
                    italic: false,
                    underline: false,
                    showMobile: true,
                    showDesktop: true,
                    connectorLine: {
                        type: 'straight',
                        circle: false,
                        stroke: 1,
                        enabled: false,
                        arrowHead: 'lines',
                        circleStyle: 'solid',
                        circleRadius: 15,
                        inheritColor: false,
                        targetPadding: 4
                    },
                    mobileFallback: true
                }
            ],
            'tooltip-x-format': 'll',
            'y-grid-subdivide': true,
            'custom-area-fills': [],
            'custom-grid-lines': '',
            'date-label-format': 'YYYY',
            'line-symbols-size': 3.5,
            'line-value-labels': false,
            'range-annotations': [],
            'show-group-labels': true,
            'show-value-labels': true,
            'line-symbols-shape': 'circle',
            'value-label-format': '0,0.[00]',
            'y-grid-label-align': 'left',
            'area-separator-color': 0,
            'area-separator-lines': false,
            'compact-group-labels': false,
            'line-symbols-opacity': 1,
            'show-category-labels': true,
            'tooltip-number-format': '0,0.[00]',
            'value-label-alignment': 'left',
            'value-label-visibility': 'always',
            'tooltip-use-custom-formats': true,
            'line-symbols-shape-multiple': {}
        },
        axes: {
            x: 'Quarter'
        },
        publish: {
            'embed-width': 600,
            'embed-height': 410,
            blocks: {
                logo: {
                    enabled: false
                },
                embed: false,
                'download-pdf': false,
                'download-svg': false,
                'get-the-data': false,
                'download-image': false
            },
            'export-pdf': {},
            autoDarkMode: false,
            'chart-height': 295
        },
        annotate: {
            notes: 'Apple stopped to report iPod sales at the end of 2014.'
        },
        custom: {}
    },
    externalData: null,
    keywords:
        'apple sales by product in shipped units, 2000 to 2017.. . apple. . apple stopped to report ipod sales at the end of 2014.. ',
    utf8: false,
    createdAt: '2022-07-11T09:41:16.000Z',
    lastModifiedAt: '2022-07-14T09:59:21.000Z',
    forkedFrom: null,
    organizationId: null,
    authorId: 2,
    folderId: null
};

const rawData = `Quarter;iPhone;iPad;Mac;iPod
Q3 2000;;;1.1;
Q4 2000;;;0.6;
Q1 2001;;;0.7;
Q2 2001;;;0.8;
Q3 2001;;;0.8;
Q4 2001;;;0.7;
Q1 2002;;;0.8;
Q2 2002;;;0.8;
Q3 2002;;;0.7;
Q4 2002;;;0.7;
Q1 2003;;;0.7;
Q2 2003;;;0.8;
Q3 2003;;;0.8;0.3
Q4 2003;;;0.8;0.7
Q1 2004;;;0.7;0.8
Q2 2004;;;0.9;0.9
Q3 2004;;;0.8;2
Q4 2004;;;1;4.6
Q1 2005;;;1.1;5.3
Q2 2005;;;1.2;6.2
Q3 2005;;;1.2;6.4
Q4 2005;;;1.3;14
Q1 2006;;;1.11;8.5
Q2 2006;;;1.33;8.1
Q3 2006;;;1.61;8.7
Q4 2006;;;1.61;21
Q1 2007;;;1.52;10.5
Q2 2007;0.27;;1.76;9.9
Q3 2007;1.12;;2.16;10.2
Q4 2007;2.32;;2.32;22.1
Q1 2008;1.7;;2.29;10.6
Q2 2008;0.72;;2.5;11
Q3 2008;6.89;;2.61;11
Q4 2008;4.36;;2.52;22.7
Q1 2009;3.79;;2.22;11
Q2 2009;5.21;;2.6;10.2
Q3 2009;7.37;;3.05;10.2
Q4 2009;8.74;;3.36;20.1
Q1 2010;8.75;;2.94;10.9
Q2 2010;8.4;3.27;3.47;9.4
Q3 2010;14.1;4.19;3.89;9
Q4 2010;16.24;7.33;4.13;19.4
Q1 2011;18.65;4.69;3.76;9
Q2 2011;20.34;9.25;3.95;7.5
Q3 2011;17.07;11.12;4.89;6.6
Q4 2011;37.04;15.43;5.2;15.4
Q1 2012;35.06;11.8;4.02;7.7
Q2 2012;26.03;17.04;4.02;6.7
Q3 2012;26.91;14.04;4.92;5.3
Q4 2012;47.79;22.86;4.06;12.7
Q1 2013;37.43;19.48;3.95;5.6
Q2 2013;31.24;14.62;3.75;4.6
Q3 2013;33.8;14.08;4.57;3.5
Q4 2013;51.03;26.04;4.84;6
Q1 2014;43.72;16.35;4.14;2.8
Q2 2014;35.2;13.28;4.41;2.9
Q3 2014;39.27;12.32;5.52;2.6
Q4 2014;74.47;21.42;5.52;3.6
Q1 2015;61.17;12.62;4.56;
Q2 2015;47.53;10.93;4.8;
Q3 2015;48.05;9.88;5.71;
Q4 2015;74.78;16.12;5.31;
Q1 2016;51.19;10.25;4.03;
Q2 2016;40.4;9.95;4.25;
Q3 2016;45.51;9.27;4.89;
Q4 2016;78.29;13.08;5.37;
Q1 2017;50.76;8.92;4.2;
Q2 2017;41.03;11.42;4.26;
Q3 2017;46.68;10.33;5.39;
Q4 2017;77.32;13.17;5.11;
Q1 2018;52.22;9.11;4.08;
Q2 2018;41.3;11.55;3.72;
Q3 2018;46.89;9.7;5.3;
Q4 2018;68.4;12.9;5.43;
Q1 2019;36.8;9.9;3.79;
Q2 2019;33.8;12.3;4.16;
Q3 2019;46.6;11.8;5.14;
Q4 2019;73.8;15.9;5.25;
Q1 2020;36.7;7.7;3.75;
Q2 2020;37.6;12.4;5.09;
Q3 2020;41.7;14;6.73;
Q4 2020;87.5;19.1;6.45;
Q1 2021;55.2;12.7;5.57;
Q2 2021;44.2;12.9;6.09;
Q3 2021;50.4;14.7;7.22;
Q4 2021;84.9;17.5;6.85;
`;

const rawVisualizations = [
    {
        id: 'd3-bars',
        namespace: 'chart',
        title: 'Bar chart',
        defaultMetadata: {
            'block-labels': false,
            background: false,
            rules: false,
            thick: false,
            'thick-arrows': false,
            'show-value-labels': true,
            'show-category-labels': true,
            'show-group-labels': true,
            'value-label-row': false,
            'value-label-visibility': 'always',
            'value-label-alignment': 'left',
            'value-label-format': '0,0.[00]',
            'date-label-format': 'YYYY',
            'swap-labels': false,
            'label-alignment': 'left',
            'compact-group-labels': false,
            'show-color-key': false,
            'sort-bars': false,
            'reverse-order': false,
            'custom-grid-lines': '',
            'force-grid': false,
            'tick-position': 'top',
            'custom-range': ['', ''],
            'base-color': 0,
            'range-extent': 'nice',
            'color-by-column': false,
            'color-category': {
                map: {},
                palette: [],
                categoryOrder: [],
                categoryLabels: {}
            },
            'group-by-column': false
        }
    },
    {
        id: 'd3-lines',
        namespace: 'chart',
        title: 'd3-lines / title',
        ariaLabel: 'Interactive line chart',
        defaultMetadata: {
            'custom-range-x': ['', ''],
            'custom-ticks-x': '',
            'x-tick-format': 'auto',
            'x-grid': 'off',
            'scale-y': 'linear',
            'y-grid-subdivide': true,
            'custom-range-y': ['', ''],
            'custom-ticks-y': '',
            'y-grid-format': 'auto',
            'y-grid': 'on',
            'y-grid-labels': 'auto',
            'y-grid-label-align': 'left',
            'base-color': 0,
            'custom-colors': {},
            'line-widths': {},
            'line-dashes': {},
            interpolation: 'linear',
            labeling: 'right',
            'line-value-labels': false,
            'connector-lines': true,
            'label-colors': false,
            'label-margin': 0,
            'show-tooltips': true,
            'tooltip-number-format': '0,0.[00]',
            'line-symbols': false,
            'line-symbols-shape': 'circle',
            'line-symbols-shape-multiple': {},
            'line-symbols-on': 'both',
            'line-symbols-size': 3.5,
            'line-symbols-opacity': 1,
            'custom-area-fills': [],
            'text-annotations': [],
            'range-annotations': []
        }
    }
];

const rawTheme = {
    id: 'datawrapper',
    title: 'Datawrapper',
    data: {}
};

const rawTeam = null;

const rawLocales = [
    {
        id: 'ar-AE',
        title: 'العربية - الإمارات',
        textDirection: 'rtl'
    },
    {
        id: 'de-DE',
        title: 'Deutsch',
        textDirection: 'ltr'
    },
    {
        id: 'en-US',
        title: 'English',
        textDirection: 'ltr'
    }
];

const disabledFields = [];

const dataReadonly = false;

const defaultTeam = { settings: {} };

const setupStoresForTest = ({
    rawChart: chartDefault = rawChart,
    rawData: dataDefault = rawData,
    rawVisualizations: visualizationsDefault = rawVisualizations,
    rawTheme: themeDefault = rawTheme,
    rawTeam: teamDefault = rawTeam,
    rawLocales: localesDefault = rawLocales,
    disabledFields: disabledFieldsDefault = disabledFields,
    dataReadonly: dataReadonlyDefault = dataReadonly
} = {}) => {
    return initStores({
        rawChart: chartDefault,
        rawData: dataDefault,
        rawVisualizations: visualizationsDefault,
        rawTheme: themeDefault,
        rawTeam: teamDefault,
        rawLocales: localesDefault,
        disabledFields: disabledFieldsDefault,
        dataReadonly: dataReadonlyDefault
    });
};

describe('edit page stores', () => {
    describe('initialization', function () {
        it('initializes stores correctly', () => {
            const { chart, visualization, theme, data, team, locale, locales } =
                setupStoresForTest();
            subscribeOnce(chart, value => expect(value).to.deep.equal(rawChart));
            subscribeOnce(visualization, value =>
                expect(value).to.deep.equal(rawVisualizations[1])
            );
            subscribeOnce(theme, value => expect(value).to.deep.equal(rawTheme));
            subscribeOnce(data, value => expect(value).to.deep.equal(rawData));
            subscribeOnce(team, value => expect(value).to.deep.equal(defaultTeam));
            subscribeOnce(locales, value => expect(value).to.deep.equal(rawLocales));
            subscribeOnce(locale, value => expect(value).to.deep.equal(rawLocales[2]));
        });
    });

    describe('metadata migration', function () {
        it('migrates old chart metadata correctly', async () => {
            const clock = FakeTimers.install();
            const oldChart = cloneDeep(rawChart);
            set(oldChart, 'metadata.publish.blocks.logo', false);
            const expectedChart = cloneDeep(rawChart);
            set(expectedChart, 'metadata.publish.blocks.logo', { enabled: false });
            const scope = nock('http://api.datawrapper.mock')
                .patch(`/v3/charts/${rawChart.id}`, {
                    metadata: { publish: { blocks: { logo: { enabled: false } } } }
                })
                .reply(200, expectedChart);

            // start test migration is taken care of automatically
            const { chart, syncChart } = setupStoresForTest({
                rawChart: oldChart
            });
            const sub = syncChart.subscribe();
            subscribeOnce(chart, value => expect(value).to.deep.equal(expectedChart));

            expect(scope.isDone()).to.equal(false);
            await clock.tickAsync(1000);
            expect(scope.isDone()).to.equal(true);
            clock.uninstall();
            sub.unsubscribe();
        });
    });

    describe('chart and data updates', function () {
        let clock;
        let chart;
        let data;
        let locale;
        let visualization;
        let theme;
        let syncChart;
        let syncData;
        let chartSyncSub;
        let dataSyncSub;
        beforeEach(() => {
            clock = FakeTimers.install();
            ({ chart, data, locale, visualization, theme, syncChart, syncData } =
                setupStoresForTest());
            chartSyncSub = syncChart.subscribe();
            dataSyncSub = syncData.subscribe();
        });

        afterEach(() => {
            clock.uninstall();
            if (chartSyncSub) {
                chartSyncSub.unsubscribe();
            }
            if (dataSyncSub) {
                dataSyncSub.unsubscribe();
            }
        });

        it('sends out patch request when the chart is updated', async () => {
            const expectedChart = cloneDeep(rawChart);
            set(expectedChart, 'metadata.test.foo', 'bar');
            const scope = nock('http://api.datawrapper.mock')
                .patch(`/v3/charts/${rawChart.id}`, {
                    metadata: { test: { foo: 'bar' } }
                })
                .reply(200, expectedChart);

            // start test
            chart.set(expectedChart);
            subscribeOnce(chart, value => expect(value).to.deep.equal(expectedChart));

            expect(scope.isDone()).to.equal(false);
            await clock.tickAsync(1000);
            expect(scope.isDone()).to.equal(true);
        });

        it('debounces patch requests when the chart is updated multiple times', async () => {
            const update1 = cloneDeep(rawChart);
            set(update1, 'metadata.test.foo', 'bar');
            const update2 = cloneDeep(update1);
            set(update2, 'metadata.test.bar', 'bar');
            const update3 = cloneDeep(update2);
            set(update3, 'metadata.test.foo', 'foo');
            const scope = nock('http://api.datawrapper.mock')
                .patch(`/v3/charts/${rawChart.id}`, {
                    metadata: { test: { foo: 'foo', bar: 'bar' } }
                })
                .reply(200, update3);

            // start test
            chart.set(update1);
            chart.set(update2);
            chart.set(update3);
            subscribeOnce(chart, value => expect(value).to.deep.equal(update3));

            expect(scope.isDone()).to.equal(false);
            await clock.tickAsync(1000);
            expect(scope.isDone()).to.equal(true);
        });

        it('updates chart locale correctly', async () => {
            const expected = cloneDeep(rawChart);
            expected.language = 'ar-AE';
            const scope = nock('http://api.datawrapper.mock')
                .patch(`/v3/charts/${rawChart.id}`, {
                    language: 'ar-AE'
                })
                .reply(200, expected);
            chart.set(expected);
            subscribeOnce(chart, value => expect(value).to.deep.equal(expected));
            subscribeOnce(locale, value => expect(value).to.deep.equal(rawLocales[0]));
            await clock.tickAsync(1000);
            expect(scope.isDone()).to.equal(true);
        });

        it('updates visualization correctly', async () => {
            const expected = cloneDeep(rawChart);
            expected.type = 'd3-bars';
            const scope = nock('http://api.datawrapper.mock')
                .patch(`/v3/charts/${rawChart.id}`, {
                    type: 'd3-bars'
                })
                .reply(200, expected);
            chart.set(expected);
            subscribeOnce(chart, value => expect(value).to.deep.equal(expected));
            subscribeOnce(visualization, value =>
                expect(value).to.deep.equal(rawVisualizations[0])
            );
            await clock.tickAsync(1000);
            expect(scope.isDone()).to.equal(true);
        });

        it('sends a put request when data is updated', async () => {
            const expectedData = `Quarter;iPhone;iPad;Mac;iPod`;

            const scope = nock('http://api.datawrapper.mock')
                .put(`/v3/charts/${rawChart.id}/data`)
                .reply(200);

            // start test
            data.set(expectedData);
            subscribeOnce(data, value => expect(value).to.deep.equal(expectedData));

            expect(scope.isDone()).to.equal(false);
            await clock.tickAsync(1000);
            expect(scope.isDone()).to.equal(true);
        });

        it('debounces put request when data is updated multiple times', async () => {
            const update1 = `Quarter;iPhone;iPad;Mac;iPod`;
            const update2 = `Quarter;iPhone;iPad;Mac;iPod
    Q3 2000;;;1.1;`;
            const update3 = `Quarter;iPhone;iPad;Mac;iPod
    Q3 2000;;;1.1;
    Q4 2000;;;0.6;`;

            const scope = nock('http://api.datawrapper.mock')
                .put(`/v3/charts/${rawChart.id}/data`)
                .reply(200);

            // start test
            data.set(update1);
            data.set(update2);
            data.set(update3);
            subscribeOnce(data, value => expect(value).to.deep.equal(update3));

            expect(scope.isDone()).to.equal(false);
            await clock.tickAsync(1000);
            expect(scope.isDone()).to.equal(true);
        });

        it('updates chart theme correctly', async () => {
            const fakeTheme = {
                id: 'fake-theme',
                title: 'Fake Theme',
                data: {}
            };
            const expected = cloneDeep(rawChart);
            expected.theme = fakeTheme.id;

            const scope = nock('http://api.datawrapper.mock')
                .get(`/v3/themes/${fakeTheme.id}?extend=true`)
                .reply(200, fakeTheme)
                .patch(`/v3/charts/${rawChart.id}`, {
                    theme: 'fake-theme'
                })
                .reply(200, expected);

            const themeSub = theme.subscribe(); // make theme observable "hot"
            chart.set(expected);
            subscribeOnce(chart, value => expect(value).to.deep.equal(expected));
            subscribeOnce(theme, value => expect(value).to.deep.equal(rawTheme)); // theme not updated yet

            await clock.tickAsync(1100);
            subscribeOnce(theme, value => expect(value).to.deep.equal(fakeTheme)); // new theme now available
            expect(scope.isDone()).to.equal(true);
            themeSub.unsubscribe();
        });

        describe('chart.bindKey', () => {
            it('returns null if the property does not exist and no default value is set', () => {
                const testFoo = chart.bindKey('metadata.test.foo');
                subscribeOnce(testFoo, value => expect(value).to.equal(null));
            });

            it('returns given default value if the property does not exist', async () => {
                const expectedChart = cloneDeep(rawChart);
                set(expectedChart, 'metadata.test.foo', 'bar');
                const scope = nock('http://api.datawrapper.mock')
                    .patch(`/v3/charts/${rawChart.id}`, {
                        metadata: { test: { foo: 'bar' } }
                    })
                    .reply(200, expectedChart);

                // start test
                const testFoo = chart.bindKey('metadata.test.foo', 'bar');
                subscribeOnce(testFoo, value => expect(value).to.equal('bar'));
                subscribeOnce(chart, value => expect(value).to.deep.equal(expectedChart));

                expect(scope.isDone()).to.equal(false);
                await clock.tickAsync(1000);
                expect(scope.isDone()).to.equal(true);
            });

            it('creates a correct two-way binding on chart.bindKey', async () => {
                const expectedChart = cloneDeep(rawChart);
                set(expectedChart, 'metadata.test.foo', 'bar');
                const scope = nock('http://api.datawrapper.mock')
                    .patch(`/v3/charts/${rawChart.id}`, {
                        metadata: { test: { foo: 'bar' } }
                    })
                    .reply(200, expectedChart);

                // start test
                const testFoo = chart.bindKey('metadata.test.foo');
                subscribeOnce(testFoo, value => expect(value).to.equal(null));
                testFoo.set('bar');
                subscribeOnce(testFoo, value => expect(value).to.equal('bar'));
                subscribeOnce(chart, value => expect(value).to.deep.equal(expectedChart));

                expect(scope.isDone()).to.equal(false);
                await clock.tickAsync(1000);
                expect(scope.isDone()).to.equal(true);
            });

            it('only emits distinct values', async () => {
                const expectedChart = cloneDeep(rawChart);
                set(expectedChart, 'metadata.test.foo', 'bar');
                set(expectedChart, 'metadata.test.bar', 'foo');
                const scope = nock('http://api.datawrapper.mock')
                    .patch(`/v3/charts/${rawChart.id}`, {
                        metadata: { test: { foo: 'bar', bar: 'foo' } }
                    })
                    .reply(200, expectedChart);

                // start test
                const testFoo = chart.bindKey('metadata.test.foo');
                const fake = sinon.fake();
                const sub = testFoo.pipe(tap(fake)).subscribe();
                testFoo.set('foo');
                testFoo.set('bar');
                testFoo.set('bar');
                testFoo.set('bar');
                chart.set(expectedChart);

                expect(fake.callCount).to.equal(3); // testFoo emitted null, foo, bar
                sub.unsubscribe();
                expect(scope.isDone()).to.equal(false);
                await clock.tickAsync(1000);
                expect(scope.isDone()).to.equal(true);
            });
        });
    });
});
