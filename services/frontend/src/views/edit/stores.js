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

/**
 * chart object store
 */
export const chart = new writable({});
const chartKeyWatchers = new Set();
chart.subscribeKey = (key, handler) => {
    chartKeyWatchers.add({ key, handler: debounce(handler, 100) });
};

/**
 * raw dataset store
 */
export const data = new writable('');

/**
 * visualization store (readonly to views)
 */
const chartType = derived(chart, $chart => $chart.type); // no need to use distinct as type is primitive
const visualizations = new writable([]);
const visualizationReadonly = derived(
    [chartType, visualizations],
    ([$chartType, $visualizations]) => {
        return $visualizations.find(vis => vis.id === $chartType) || visualizations[0] || {};
    }
);
export { visualizationReadonly as visualization };

/**
 * theme store (readonly to views)
 */
const theme = new writable({});
const themeReadonly = derived(theme, $theme => $theme);
export { themeReadonly as theme };

/**
 * dataset store (readonly to views
 */
const dataOpts = distinct(derived(chart, $chart => get($chart, 'metadata.data')));
export const dataset = derived([data, dataOpts], ([$data, $dataOpts]) => {
    return delimited({
        csv: $data,
        transpose: $dataOpts.transpose,
        firstRowIsHeader: $dataOpts['horizontal-header']
    }).parse();
});

export const onNextSave = new Set();

export const hasUnsavedChanges = new writable(false);

export const saveError = new writable(false);
export const saveSuccess = new writable(false);

/**
 * store for dark mode state
 */
export const isDark = new writable(false);

let unsavedChanges = {};

const ALLOWED_CHART_KEYS = [
    'title',
    'theme',
    'type',
    'metadata',
    'language',
    'externalData',
    'lastEditStep'
];

export function initChartStore(rawChart, rawTheme, rawVisualizations, disabledFields = []) {
    chart.set(rawChart);
    theme.set(rawTheme);
    visualizations.set(rawVisualizations);
    let prevState;

    const patchChartSoon = debounce(async function (id) {
        const changesToSave = cloneDeep(unsavedChanges);
        let savingFailed = false;

        /*
         * even though changes haven't been saved yet, clear
         * now instead of after request, so that we don't
         * end up deleting any new changes that come in while
         * the request is running on request completion
         */
        unsavedChanges = {};

        if (Object.keys(changesToSave).length > 0) {
            try {
                await httpReq.patch(`/v3/charts/${id}`, {
                    payload: changesToSave
                });
                saveError.set(false);
                if (!Object.keys(unsavedChanges).length) {
                    hasUnsavedChanges.set(false);
                }
                for (const method of onNextSave) {
                    method();
                    onNextSave.delete(method);
                }
                if (!Object.keys(unsavedChanges).length) {
                    hasUnsavedChanges.set(false);
                }
                saveSuccess.set(true);
                setTimeout(() => {
                    saveSuccess.set(false);
                }, 1000);
            } catch (err) {
                // restore unsaved changes that failed to save
                unsavedChanges = assign(changesToSave, unsavedChanges);
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

    chart.subscribe(async value => {
        if (!prevState && value.id) {
            // initial set
            prevState = cloneDeep(value);
        } else if (prevState && !isEqual(prevState, value)) {
            // find out what has been changed
            // but ignore changes to disabled fields
            const patch = filterNestedObjectKeys(
                objectDiff(prevState, value, ALLOWED_CHART_KEYS),
                disabledFields
            );

            const newUnsaved = Object.keys(patch).length > 0;
            // and store the patch
            assign(unsavedChanges, patch);

            prevState = cloneDeep(value);
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

            if (unsavedChanges.theme) {
                // chart theme has changed, update theme store
                const newTheme = await httpReq.get(`/v3/themes/${unsavedChanges.theme}`);
                theme.set(newTheme);
            }
        }
    });
}

export function initDataStore(chartId, rawData) {
    let prevState;
    let unsavedState;

    data.set(rawData);

    const storeDataSoon = debounce(async function () {
        try {
            await httpReq.put(`/v3/charts/${chartId}/data`, {
                body: unsavedState,
                headers: {
                    // @todo: handle json data as well
                    'Content-Type': 'text/csv'
                }
            });
            saveError.set(false);
            prevState = unsavedState;
            if (!Object.keys(unsavedChanges).length) {
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
        if (prevState === undefined && value !== undefined) {
            // initial set
            prevState = cloneDeep(value);
        } else if (prevState !== undefined && !isEqual(prevState, value) && value !== '') {
            unsavedState = value;
            hasUnsavedChanges.set(true);
            storeDataSoon();
        }
    });
}

/**
 * store for team
 */
const team = new writable({ settings: {} });
const teamReadonly = derived(team, $settings => $settings);
export { teamReadonly as team };
// export setter function
export function initTeamStore(rawTeam) {
    team.set(rawTeam);
}
