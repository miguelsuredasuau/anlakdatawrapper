import { configure, render, fireEvent } from '@testing-library/svelte';
import Context from '../utils/svelte-view/Context.svelte';
import { getLocale } from './setup-locales.mjs';
import cloneDeep from 'lodash/cloneDeep';
import objectDiff from '@datawrapper/shared/objectDiff';
import { get as getStoreValue } from 'svelte/store';
import set from 'lodash/set';

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
    const watchers = new Map();
    store.subscribeKey = (key, handler) => {
        watchers.set(key, handler);
    };
    store.setKey = (key, value) => {
        const prev = getStoreValue(store);
        set(prev, key, value);
        store.set(prev);
        if (watchers.get(key)) {
            watchers.get(key)(value);
        }
    };
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
