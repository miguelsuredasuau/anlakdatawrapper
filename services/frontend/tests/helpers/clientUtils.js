import { configure, render, fireEvent } from '@testing-library/svelte';
import Context from '../../src/utils/svelte-view/Context.svelte';
import { getLocale } from './setup-locales.mjs';
import cloneDeep from 'lodash/cloneDeep';
import objectDiff from '@datawrapper/shared/objectDiff.js';
import { get as getStoreValue } from 'svelte/store';
import get from 'lodash/get';
import set from 'lodash/set';
import isEqual from 'lodash/isEqual';
import { take, tap } from 'rxjs/operators';

export function setConfig(config) {
    configure(config);
}

export const defaultStores = {
    config: {
        apiDomain: 'api.datawrapper.local',
        frontendDomain: 'app.datawrapper.local',
        imageDomain: 'charts.datawrapper.local/preview',
        dev: 'true',
        footerLinks: [],
        languages: ['en-US'],
        headerLinks: [],
        stickyHeaderThreshold: 800
    },
    messages: getLocale(),
    browser: {
        isIE: false
    },
    user: {
        id: 2,
        name: 'user@datawrapper.de',
        email: 'user@datawrapper.de',
        language: 'en-US',
        isAdmin: false,
        isGuest: false,
        teams: [],
        activeTeam: null,
        isActivated: true
    },
    userData: {},
    request: {
        method: 'get',
        // url: [URL],
        path: '/archive',
        params: {},
        referrer: 'http://app.datawrapper.local/',
        query: {}
    }
};

export async function renderWithContext(view, props = {}, stores = {}) {
    // load locales again, in case the test loaded
    // additional plugin locales
    defaultStores.messages = getLocale();
    const context = render(Context, {
        props: {
            stores: {
                ...defaultStores,
                ...stores
            },
            view,
            ...props
        }
    });

    return { ...context, component: context.component.ref, stores };
}

export function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * Tracks changes to the provided store and
 * calles the handler function if something has
 * changed. The handler function receives the
 * object diff of the change as argument.
 *
 * @param {svelte/store} store
 * @param {function} handler
 */
export function trackStoreChanges(store, handler) {
    let current;
    store.subscribe(val => {
        if (!current) {
            // initial set
            current = cloneDeep(val);
        } else {
            val = cloneDeep(val);
            const diff = objectDiff(current, val);
            if (Object.keys(diff).length > 0) {
                handler(diff);
            }
            current = val;
        }
    });
}

export function mockTranslations(messages) {
    return d => messages[d] || d;
}

/**
 * this is a helper method that extends a svelte/writable store
 * with the two methods `subscribeKey` and `setKey`:
 *
 * - `subscribeKey` is a helper method we're also using in out editor views to sync
 *    component state to changes in a chart store.
 * - `setKey` is a helper method we use in tests to simlulate store changes
 *    that do not originate from the component to check if it updates its internal
 *    state correctly
 *
 * @param {svelte/writable} store
 * @returns
 */
export function storeWithSetKey(store) {
    const watchers = new Set();
    store.subscribeKey = (key, handler) => {
        watchers.add({ key, handler });
    };
    store.setKey = (key, value) => {
        const prev = cloneDeep(getStoreValue(store));
        set(prev, key, value);
        store.set(prev);
    };
    let prevState = cloneDeep(getStoreValue(store));
    store.subscribe(async value => {
        if (prevState && !isEqual(prevState, value)) {
            const patch = objectDiff(prevState, value);
            prevState = cloneDeep(value);
            if (Object.keys(patch).length) {
                for (const { key, handler } of watchers) {
                    const value = get(patch, key);
                    if (value !== undefined && value !== null) {
                        handler(value);
                    }
                }
            }
        }
    });
    return store;
}

/**
 * a more convenient way to trigger clicks on an element
 * @param {DOMElement} element
 */
export async function clickOn(element) {
    await fireEvent(
        element,
        new MouseEvent('click', {
            bubbles: true
        })
    );
}

export async function fireChangeEvent(element) {
    await fireEvent(
        element,
        new window.Event('change', {
            bubbles: true
        })
    );
}

/**
 * a more convenient way to change the value of an input
 * @param {DOMElement} input
 * @param {string} newValue
 */
export async function changeValueTo(input, newValue) {
    await fireEvent.input(input, { target: { value: newValue } });
    return fireEvent.change(input);
}

/**
 *
 * @param {*} delay
 * @returns
 */
export function waitFor(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

export function subscribeOnce(store, handler) {
    store.pipe(take(1), tap(handler)).subscribe();
}
