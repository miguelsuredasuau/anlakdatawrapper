import { writable, derived } from 'svelte/store';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import assign from 'assign-deep';
import debounce from 'lodash/debounce';
import httpReq from '@datawrapper/shared/httpReq';
import objectDiff from '@datawrapper/shared/objectDiff';
import get from '@datawrapper/shared/get';
import { filterNestedObjectKeys } from '../../utils';
import delimited from '@datawrapper/chart-core/lib/dw/dataset/delimited.mjs';
import { distinct } from '../../utils/svelte-store';
import coreMigrate from '@datawrapper/chart-core/lib/migrate';

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
    rawData,
    rawTeam,
    rawTheme,
    rawLocales,
    rawVisualizations,
    disabledFields = [],
    dataReadonly
}) {
    /**
     * chart object store
     */
    const chart = new writable(rawChart);
    const chartKeyWatchers = new Set();

    /**
     * data store --> can be used to update the underlying data of a chart
     */
    const data = new writable(rawData);

    /**
     * store for team
     */
    const team = new writable(rawTeam || { settings: {} });
    const teamReadonly = derived(team, $team => $team, {});

    const onNextSave = new Set();
    const hasUnsavedChanges = new writable(false);
    const saveError = new writable(false);
    const saveSuccess = new writable(false);

    /**
     * store for dark mode state
     */
    const isDark = new writable(false);

    let unsavedChartChanges = {};

    /**
     * Subscribe to changes of a certain key within the chart store
     *
     * @param {string} key
     * @param {function} handler
     * @returns {function} - to unsubscribe
     */
    chart.subscribeKey = (key, handler) => {
        const watcher = { key, handler: debounce(handler, 100) };
        chartKeyWatchers.add(watcher);
        return () => chartKeyWatchers.remove(watcher);
    };

    /**
     * visualization store (readonly to views)
     */
    const chartType = derived(chart, $chart => $chart.type, ''); // no need to use distinct as type is primitive
    const visualizations = new writable(rawVisualizations);
    const visualization = derived(
        [chartType, visualizations],
        ([$chartType, $visualizations]) => {
            return $visualizations.find(vis => vis.id === $chartType) || visualizations[0] || {};
        },
        visualizations[0]
    );

    /**
     * theme store (readonly to views)
     */
    const theme = new writable(rawTheme);
    const themeReadonly = derived(theme, $theme => $theme, rawTheme);

    /**
     * dataset store (readonly to views)
     */
    const dataOptions = distinct(derived(chart, $chart => get($chart, 'metadata.data'), {}));
    const dataset = derived(
        [data, dataOptions],
        ([$data, $dataOptions]) => {
            return delimited({
                csv: $data,
                transpose: $dataOptions.transpose,
                firstRowIsHeader: $dataOptions['horizontal-header']
            }).parse();
        },
        {}
    );

    /**
     * the editor mode determines which resizer controls are
     * displayed below the chart preview and if it's resizable
     */
    const editorMode = derived(
        [chart, theme],
        ([$chart, $theme]) => {
            return get($chart, 'metadata.custom.webToPrint.mode', 'web') === 'print' ||
                get($theme, 'data.type', 'web') === 'print'
                ? 'print'
                : 'web';
        },
        'web'
    );

    const isFixedHeight = derived(
        [visualization, editorMode],
        ([$visualization, $editorMode]) => {
            const { height, supportsFitHeight } = $visualization;
            return $editorMode === 'web'
                ? height === 'fixed'
                : height === 'fixed' && !supportsFitHeight;
        },
        false
    );

    const locales = new writable(rawLocales);
    const chartLocale = derived(chart, $chart => $chart.language || 'en-US', 'en-US');
    const localeReadOnly = derived(
        [chartLocale, locales],
        ([$chartLocale, $locales]) => {
            return (
                $locales.find(l => l.id === $chartLocale) || $locales.find(l => l.id === 'en-US')
            );
        },
        'en-US'
    );

    const patchChartSoon = debounce(async function (id) {
        const changesToSave = cloneDeep(unsavedChartChanges);
        let savingFailed = false;

        /*
         * even though changes haven't been saved yet, clear
         * now instead of after request, so that we don't
         * end up deleting any new changes that come in while
         * the request is running on request completion
         */
        unsavedChartChanges = {};

        if (Object.keys(changesToSave).length > 0) {
            try {
                await httpReq.patch(`/v3/charts/${id}`, {
                    payload: changesToSave
                });
                saveError.set(false);
                if (!Object.keys(unsavedChartChanges).length) {
                    hasUnsavedChanges.set(false);
                }
                for (const method of onNextSave) {
                    method();
                    onNextSave.delete(method);
                }
                if (!Object.keys(unsavedChartChanges).length) {
                    hasUnsavedChanges.set(false);
                }
                saveSuccess.set(true);
                setTimeout(() => {
                    saveSuccess.set(false);
                }, 1000);
            } catch (err) {
                // restore unsaved changes that failed to save
                unsavedChartChanges = assign(changesToSave, unsavedChartChanges);
                savingFailed = true;
                console.error(err);
                saveError.set(err);
            }
        } else {
            hasUnsavedChanges.set(false);
        }
        if (!savingFailed) {
            /*
             * invoke onNextSave handlers regardless
             * of whether or not there where changes
             * to be saved, unless saving failed
             */
            for (const method of onNextSave) {
                method();
                onNextSave.delete(method);
            }
        }
    }, 1000);

    let prevChartState;
    chart.subscribe(async value => {
        if (!prevChartState && value.id) {
            // initial set
            prevChartState = cloneDeep(value);
        } else if (prevChartState && !isEqual(prevChartState, value)) {
            // find out what has been changed
            // but ignore changes to disabled fields
            const patch = filterNestedObjectKeys(
                objectDiff(prevChartState, value, ALLOWED_CHART_KEYS),
                disabledFields
            );

            const newUnsaved = Object.keys(patch).length > 0;
            // and store the patch
            assign(unsavedChartChanges, patch);

            prevChartState = cloneDeep(value);
            if (newUnsaved) {
                hasUnsavedChanges.set(true);
                patchChartSoon(value.id);

                for (const { key, handler } of chartKeyWatchers) {
                    const value = get(patch, key);
                    if (value !== undefined && value !== null) {
                        handler(value);
                    }
                }
            }

            if (unsavedChartChanges.theme) {
                // chart theme has changed, update theme store
                const newTheme = await httpReq.get(
                    `/v3/themes/${unsavedChartChanges.theme}?extend=true`
                );
                theme.set(newTheme);
            }
        }
    });

    // apply core migrations after subscribing so changes get stored
    const clonedRawChart = cloneDeep(rawChart);
    coreMigrate(clonedRawChart.metadata);
    chart.set(clonedRawChart);

    let prevDataState;
    let unsavedDataState;
    const storeDataSoon = debounce(async function () {
        try {
            await httpReq.put(`/v3/charts/${rawChart.id}/data`, {
                body: unsavedDataState,
                headers: {
                    // @todo: handle json data as well
                    'Content-Type': 'text/csv'
                }
            });
            saveError.set(false);
            prevDataState = unsavedDataState;
            if (!Object.keys(unsavedChartChanges).length) {
                hasUnsavedChanges.set(false);
            }
            for (const method of onNextSave) {
                method();
                onNextSave.delete(method);
            }
        } catch (err) {
            console.error(err);
            saveError.set(err);
        }
    }, 1000);

    data.subscribe(value => {
        if (dataReadonly) return;
        if (prevDataState === undefined && value !== undefined) {
            // initial set
            prevDataState = cloneDeep(value);
        } else if (prevDataState !== undefined && !isEqual(prevDataState, value) && value !== '') {
            unsavedDataState = value;
            hasUnsavedChanges.set(true);
            storeDataSoon();
        }
    });

    return {
        chart,
        data,
        visualization,
        team: teamReadonly,
        theme: themeReadonly,
        dataset,
        editorMode,
        isFixedHeight,
        locales,
        locale: localeReadOnly,
        onNextSave,
        hasUnsavedChanges,
        saveError,
        saveSuccess,
        isDark
    };
}
