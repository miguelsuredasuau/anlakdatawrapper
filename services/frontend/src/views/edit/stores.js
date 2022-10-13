import { writable } from 'svelte/store';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import httpReq from '@datawrapper/shared/httpReq';
import objectDiff from '@datawrapper/shared/objectDiff';
import get from '@datawrapper/shared/get';
import set from '@datawrapper/shared/set';
import { filterNestedObjectKeys } from '../../utils';
import delimited from '@datawrapper/chart-core/lib/dw/dataset/delimited.mjs';
import coreMigrate from '@datawrapper/chart-core/lib/migrate';
import reorderColumns from '@datawrapper/chart-core/lib/dw/dataset/reorderColumns.mjs';
import applyChanges from '@datawrapper/chart-core/lib/dw/dataset/applyChanges.mjs';
import addComputedColumns from '@datawrapper/chart-core/lib/dw/dataset/addComputedColumns.mjs';
import filterDatasetColumns from '@datawrapper/chart-core/lib/dw/utils/filterDatasetColumns.mjs';
import populateVisAxes from '@datawrapper/chart-core/lib/dw/utils/populateVisAxes.mjs';
import { SvelteSubject } from '../../utils/rxjs-store.mjs';
import assign from 'assign-deep';
import {
    distinctUntilChanged,
    tap,
    map,
    debounceTime,
    filter,
    switchMap,
    mergeMap,
    withLatestFrom,
    catchError,
    shareReplay,
    skip,
    startWith,
    pairwise,
    take
} from 'rxjs/operators';
import { of, from, combineLatest, merge } from 'rxjs';

const ALLOWED_CHART_KEYS = [
    'title',
    'theme',
    'type',
    'metadata',
    'language',
    'externalData',
    'lastEditStep'
];

export function initStores({
    rawChart,
    rawTheme,
    rawLocales,
    rawVendorLocales,
    rawVisualizations,
    rawTeam,
    rawData,
    rawReadonlyKeys,
    dataReadonly
}) {
    const { chart$, distinctChart$ } = initChartStore(rawChart);
    const data$ = new SvelteSubject(rawData);
    const team$ = of(rawTeam || { settings: {} }); // read-only
    const locales$ = of(rawLocales); // read-only
    const readonlyKeys$ = new SvelteSubject(rawReadonlyKeys);

    const chartId$ = distinctChart$.pipe(map(chart => chart.id));

    const hasUnsavedChanges = new writable(false);
    const saveError = new writable(false);
    const saveSuccess = new writable(false);

    /**
     * store for dark mode state
     */
    const isDark = new writable(false);

    const readonlyKeysSet$ = readonlyKeys$.pipe(
        distinctUntilChanged(),
        map(keys => new Set(keys))
    );

    const patchChart = ({ id, patch }) => {
        return of({ id, patch }).pipe(
            switchMap(({ id, patch }) =>
                httpReq.patch(`/v3/charts/${id}`, {
                    payload: patch
                })
            ),
            tap(() => {
                hasUnsavedChanges.set(false);
                saveSuccess.set(true);
                saveError.set(false);
                setTimeout(() => {
                    saveSuccess.set(false);
                }, 1000);
            }),
            catchError(err => {
                console.warn(err);
                saveError.set(err);
                return of(false);
            })
        );
    };

    // chart subject representing the last version that came from the server
    const latestSavedChart$ = new SvelteSubject(cloneDeep(rawChart));
    const patchChart$ = distinctChart$.pipe(
        withLatestFrom(latestSavedChart$, readonlyKeys$), // compare with version that was last saved
        map(([newChart, oldChart, readonlyKeys]) => ({
            id: newChart.id,
            patch: filterNestedObjectKeys(
                objectDiff(oldChart, newChart, ALLOWED_CHART_KEYS),
                readonlyKeys
            )
        })),
        tap(({ patch }) => hasUnsavedChanges.set(Object.keys(patch).length > 0)),
        debounceTime(1000), // debounce 1 second
        filter(({ patch }) => Object.keys(patch).length > 0),
        mergeMap(patchChart),
        filter(savedSuccessfully => savedSuccessfully),
        tap(newestChart => latestSavedChart$.next(newestChart)),
        shareReplay(1)
    );

    // apply core migrations after subscribing so changes get stored
    const clonedRawChart = cloneDeep(rawChart);
    coreMigrate(clonedRawChart.metadata);
    chart$.set(clonedRawChart);

    const visualization$ = distinctChart$.pipe(
        map(chart => chart.type),
        distinctUntilChanged(),
        map(type => rawVisualizations.find(vis => vis.id === type) || rawVisualizations[0])
    );

    // current theme
    const theme$ = distinctChart$.pipe(
        map(chart => chart.theme),
        distinctUntilChanged(),
        skip(1),
        filter(themeId => themeId),
        debounceTime(100),
        switchMap(themeId => {
            return from(httpReq.get(`/v3/themes/${themeId}?extend=true`)).pipe(
                catchError(err => {
                    console.warn(`Failed to fetch theme ${themeId} (${err})`);
                    return of(false);
                })
            );
        }),
        startWith(rawTheme),
        filter(theme => theme),
        shareReplay(1)
    );

    const editorMode$ = combineLatest([distinctChart$, theme$]).pipe(
        map(([chart, theme]) => {
            return get(chart, 'metadata.custom.webToPrint.mode', 'web') === 'print' ||
                get(theme, 'data.type', 'web') === 'print'
                ? 'print'
                : 'web';
        }),
        distinctUntilChanged(),
        shareReplay(1)
    );

    const isFixedHeight$ = combineLatest([visualization$, editorMode$]).pipe(
        map(([visualization, editorMode]) => {
            const { height, supportsFitHeight } = visualization;
            return editorMode === 'web'
                ? height === 'fixed'
                : height === 'fixed' && !supportsFitHeight;
        })
    );

    const locale$ = distinctChart$.pipe(
        map(chart => chart.language || 'en-US'),
        map(chartLocale => rawLocales.find(l => l.id === chartLocale))
    );

    const vendorLocales$ = combineLatest([locale$, team$]).pipe(
        map(([{ id: locale = {} }, team]) => {
            return Object.fromEntries(
                Object.entries(rawVendorLocales).map(([vendor, locales]) => {
                    const settings = locales[locale];
                    if (!settings) return [vendor, null];
                    const localeBase = eval(settings);
                    const custom = get(team, `settings.locales.${vendor}.${locale}`, {});
                    return [vendor, assign(localeBase, custom)];
                })
            );
        })
    );

    // read-only dataset
    const dataOptions$ = distinctChart$.pipe(
        map(chart => chart.metadata.data),
        distinctUntilChanged(isEqual)
    );
    // read-only computed columns
    const computedColumns$ = distinctChart$.pipe(
        map(chart => chart.metadata.describe['computed-columns'] || []),
        distinctUntilChanged(isEqual)
    );
    // read-only observable of user-preferences for axis column assignments
    const userAxes$ = distinctChart$.pipe(
        map(chart => chart.metadata.axes || {}),
        distinctUntilChanged(isEqual)
    );
    // read-only observable of visualization axes definitions
    const visAxes$ = visualization$.pipe(
        map(vis => vis.axes || {}),
        distinctUntilChanged(isEqual)
    );
    // readonly observable of "override keys", which allow chart metadata
    // settings to influence the behavior in populateVisAxes()
    const overrideKeys$ = combineLatest([distinctChart$, visAxes$]).pipe(
        map(([chart, visAxes]) =>
            Object.fromEntries(
                Object.entries(visAxes)
                    .filter(([, axis]) => axis.optional && axis.overrideOptionalKey)
                    .map(([, axis]) => [
                        axis.overrideOptionalKey,
                        get(chart.metadata, axis.overrideOptionalKey, false)
                    ])
            )
        ),
        distinctUntilChanged(isEqual)
    );

    // mock chart object with .get and .getMetadata accessor
    // methods, used in reorderColumns() etc.
    const dwChart$ = distinctChart$.pipe(
        map(chart => ({
            get() {
                return chart;
            },
            getMetadata(key, defaultValue) {
                return get(chart.metadata, key, defaultValue);
            }
        }))
    );

    const tableDataset$ = combineLatest([
        data$,
        dataOptions$,
        overrideKeys$,
        computedColumns$
    ]).pipe(
        withLatestFrom(dwChart$),
        map(([[data, options], chart]) => {
            return reorderColumns(
                chart,
                applyChanges(
                    chart,
                    addComputedColumns(
                        chart,
                        delimited({
                            csv: data,
                            transpose: options.transpose,
                            firstRowIsHeader: options['horizontal-header']
                        }).parse()
                    )
                )
            );
        })
    );

    const dataset$ = combineLatest([
        data$,
        dataOptions$,
        userAxes$,
        visAxes$,
        overrideKeys$,
        computedColumns$
    ]).pipe(
        withLatestFrom(dwChart$),
        map(([[data, options, userAxes, visAxes, overrideKeys], chart]) => {
            if (options && options.json) {
                try {
                    return JSON.parse(data);
                } catch (err) {
                    return { error: 'could not parse json data' };
                }
            }
            const dataset = filterDatasetColumns(
                chart,
                reorderColumns(
                    chart,
                    applyChanges(
                        chart,
                        addComputedColumns(
                            chart,
                            delimited({
                                csv: data,
                                transpose: options.transpose,
                                firstRowIsHeader: options['horizontal-header']
                            }).parse()
                        )
                    )
                )
            );
            // populate vis axes to generate 'virtual' columns in case
            // of insufficient datasets (e.g. missing label column)
            populateVisAxes({ dataset, userAxes, visAxes, overrideKeys });
            return dataset;
        })
    );

    const storeData = ({ id, data }) => {
        return of({ id, data }).pipe(
            switchMap(({ id, data }) =>
                httpReq.put(`/v3/charts/${id}/data`, {
                    body: data,
                    headers: {
                        // @todo: handle json data as well
                        'Content-Type': 'text/csv'
                    }
                })
            ),
            tap(() => {
                hasUnsavedChanges.set(false);
                saveSuccess.set(true);
                saveError.set(false);
                setTimeout(() => {
                    saveSuccess.set(false);
                }, 1000);
            }),
            catchError(err => {
                console.warn(err);
                saveError.set(err);
                return of(false);
            })
        );
    };
    const putData$ = data$.pipe(
        skip(1),
        filter(() => !dataReadonly),
        filter(data => data),
        distinctUntilChanged(isEqual),
        withLatestFrom(distinctChart$),
        // no need to update the data for google spreadsheets and external data
        filter(
            ([, chart]) =>
                !['google-spreadsheet', 'external-data'].includes(
                    get(chart, 'metadata.data.upload-method', 'copy')
                )
        ),
        map(([data]) => data),
        tap(() => hasUnsavedChanges.set(true)),
        debounceTime(1000),
        withLatestFrom(chartId$),
        map(([data, id]) => ({ id, data })),
        mergeMap(storeData),
        shareReplay(1)
    );

    const syncExternalData = chartId => {
        return from(httpReq.post(`/v3/charts/${chartId}/data/refresh`)).pipe(
            switchMap(() => httpReq.get(`/v3/charts/${chartId}/data`)),
            tap(externalData => data$.set(externalData)),
            catchError(err => {
                console.warn(err);
                return of(false);
            })
        );
    };

    const syncExternalMetadata = chartId => {
        return from(httpReq.post(`/v3/charts/${chartId}/data/refresh`)).pipe(
            switchMap(() => httpReq.get(`/v3/charts/${chartId}`)),
            withLatestFrom(chart$),
            tap(([{ metadata, title, readonlyKeys }, oldChart]) => {
                readonlyKeys$.set(readonlyKeys);
                chart$.set({
                    ...oldChart,
                    title,
                    metadata
                });
            })
        );
    };

    // Observable listening to changes of the upload-method.
    // We subscribe to latestSavedChart$ instead of distinctChart$
    // to make sure we are in sync with the version stored at the server.
    const uploadMethod$ = latestSavedChart$.pipe(
        map(chart => get(chart, 'metadata.data.upload-method')),
        distinctUntilChanged(isEqual)
    );
    const googleSheet$ = latestSavedChart$.pipe(
        map(chart => get(chart, `metadata.data.google-spreadsheet-src`)),
        distinctUntilChanged(isEqual),
        filter(source => source) // only emit if source is defined
    );
    const externalData$ = latestSavedChart$.pipe(
        map(chart => get(chart, `metadata.data.external-data`)),
        distinctUntilChanged(isEqual),
        filter(source => source) // only emit if source is defined
    );
    const getExternalData$ = uploadMethod$.pipe(
        skip(1),
        filter(method => ['external-data', 'google-spreadsheet'].includes(method)),
        switchMap(method => (method === 'external-data' ? externalData$ : googleSheet$)),
        withLatestFrom(latestSavedChart$),
        switchMap(([, chart]) => syncExternalData(chart.id)),
        shareReplay(1)
    );
    const externalMetadata$ = latestSavedChart$.pipe(
        map(chart => get(chart, `metadata.data.external-metadata`)),
        distinctUntilChanged(isEqual)
    );

    /*
     * sync external metadata url changes and refresh
     * the chart$ and readonlyKeys$
     */
    const getExternalMetadata$ = merge(
        // ...either if the upload method changes
        uploadMethod$.pipe(
            pairwise(),
            // note: the first emission is the initial chart state, but we don't need to skip it,
            // because the pairwise() above makes sure the pipeline only continues once there is
            // at least two emissions, i.e. once the upload method changes from the initial state
            // but only if changed to or from 'external-data'
            filter(([prevMethod, newMethod]) => {
                return prevMethod === 'external-data' || newMethod === 'external-data';
            }),
            // also check that external metadata url is defined
            withLatestFrom(externalMetadata$),
            filter(([, externalMetadata]) => externalMetadata)
        ),
        // ...or if the external metadata has url changed
        externalMetadata$.pipe(
            // skip the first emission, because it's the initial chart state
            skip(1),
            withLatestFrom(latestSavedChart$),
            // but only if current upload method is external-data
            // note: we can't use uploadMethod$ here because this only emits
            // if the user changed it since opening the page
            filter(([, chart]) => get(chart, 'metadata.data.upload-method') === 'external-data')
        )
    ).pipe(
        // then sync the chart object
        withLatestFrom(chartId$),
        switchMap(([, chartId]) => syncExternalMetadata(chartId))
    );

    return {
        chart: chart$,
        data: data$,
        tableDataset: tableDataset$,
        team: team$,
        theme: theme$,
        dataset: dataset$,
        visualization: visualization$,
        locale: locale$,
        locales: locales$,
        vendorLocales: vendorLocales$,
        editorMode: editorMode$,
        isFixedHeight: isFixedHeight$,
        onNextSave(handler) {
            return merge(putData$, patchChart$, of(true))
                .pipe(debounceTime(100), skip(1), take(1), tap(handler))
                .subscribe();
        },
        hasUnsavedChanges,
        saveError,
        saveSuccess,
        isDark,
        syncData: putData$,
        syncExternalData: getExternalData$,
        syncExternalMetadata: getExternalMetadata$,
        syncChart: patchChart$,
        readonlyKeys: readonlyKeysSet$
    };
}

export function initChartStore(initialValue) {
    const chart$ = new SvelteSubject(initialValue);

    // distinctChart$ only emits a value if a chart property (including nested properties) changes
    // It gives the guarantee that between two consecutive submissions
    // chartA and chartB => isEqual(chartA, chartB) = false
    const distinctChart$ = chart$.pipe(
        map(cloneDeep), // clone so that isEqual has an effect (and doesn't compare the same object)
        distinctUntilChanged(isEqual),
        shareReplay(1)
    );

    /**
     * Subscribe to changes of a certain key within the chart store
     *
     * @param {string} key
     * @param {function} handler
     * @returns {function} - to unsubscribe
     */
    chart$.subscribeKey = (key, handler, debounce = 100) => {
        const sub = distinctChart$
            .pipe(
                map(chart => get(chart, key)),
                distinctUntilChanged(isEqual),
                debounceTime(debounce),
                tap(handler)
            )
            .subscribe();
        return () => sub.unsubscribe();
    };

    /**
     * Like subscribeKey, but passes the previous value as
     * second argument to the handler method
     *
     * @param {string} key
     * @param {function} handler
     * @returns {function} - to unsubscribe
     */
    chart$.observeKey = (key, handler, debounce = 100) => {
        const sub = distinctChart$
            .pipe(
                map(chart => get(chart, key)),
                distinctUntilChanged(isEqual),
                pairwise(),
                debounceTime(debounce),
                tap(([prevVal, newVal]) => handler(newVal, prevVal))
            )
            .subscribe();
        return () => sub.unsubscribe();
    };

    chart$.bindKey = (key, defaultValue) => {
        const setChartValue = value => {
            const clonedChart = cloneDeep(chart$.value);
            set(clonedChart, key, value);
            chart$.set(clonedChart);
        };
        const writableKey$ = distinctChart$.pipe(
            map(chart => get(chart, key)),
            map(value => {
                if (value === null && defaultValue) {
                    setChartValue(defaultValue);
                    return defaultValue;
                }
                return value;
            }),
            distinctUntilChanged(isEqual)
        );
        writableKey$.set = setChartValue;
        return writableKey$;
    };

    return { chart$, distinctChart$ };
}
