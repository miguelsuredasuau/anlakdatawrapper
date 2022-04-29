import { writable } from 'svelte/store';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import assign from 'assign-deep';
import debounce from 'lodash/debounce';
import httpReq from '@datawrapper/shared/httpReq';
import objectDiff from '@datawrapper/shared/objectDiff';

/**
 * chart object store
 */
export const chart = new writable({});

/**
 * raw dataset store
 */
export const data = new writable('');

export const onNextSave = new Set();
export const hasUnsavedChanges = new writable(false);
export const saveError = new writable(false);

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

export function initChartStore(rawChart) {
    chart.set(rawChart);
    let prevState;

    const patchChartSoon = debounce(async function (id) {
        const changesToSave = cloneDeep(unsavedChanges);

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
            } catch (err) {
                // restore unsaved changes that failed to save
                unsavedChanges = assign(changesToSave, unsavedChanges);
                console.error(err);
                saveError.set(err);
            }
        }
    }, 1000);

    chart.subscribe(value => {
        if (!prevState && value.id) {
            // initial set
            prevState = cloneDeep(value);
        } else if (prevState && !isEqual(prevState, value)) {
            // find out what has been changed
            const patch = objectDiff(prevState, value, ALLOWED_CHART_KEYS);
            const newUnsaved = Object.keys(patch).length > 0;
            // and store the patch
            assign(unsavedChanges, patch);

            prevState = cloneDeep(value);
            if (newUnsaved) {
                hasUnsavedChanges.set(true);
                patchChartSoon(value.id);
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
