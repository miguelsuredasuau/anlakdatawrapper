import { writable, derived, get } from 'svelte/store';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

/**
 * This returns a store based on source store that only emits a new value if the previous and current value are distinct.
 * By default uses a deep equality comparison but can be overridden to use a custom equality check
 * e.g. only compare certain properties.
 * @param store
 * @param compareFn
 */
export function distinct(store, compareFn = isEqual) {
    const source = new writable(get(store));
    const readOnly = new derived(source, $source => $source);
    let oldValue;
    const storeUnsub = store.subscribe(val => {
        if (!compareFn(val, oldValue)) {
            source.set(val);
            oldValue = cloneDeep(val);
        }
    });
    return {
        subscribe(func) {
            const unsub = readOnly.subscribe(func);
            return () => {
                unsub();
                storeUnsub();
            };
        }
    };
}
