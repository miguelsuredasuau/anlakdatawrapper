<script>
    import { onMount, getContext, beforeUpdate, createEventDispatcher } from 'svelte';
    import dw from '@datawrapper/chart-core/dist/dw-2.0.cjs';
    import clone from 'lodash/cloneDeep';
    import isEqual from 'underscore/modules/isEqual.js';
    import { waitFor } from './shared';

    export let id;
    export let js;
    export let css;
    export let data;
    export let storeData;
    export let storeMethods;
    export let module = 'App';

    const messages = getContext('messages');
    const config = getContext('config');
    const userData = getContext('userData');

    let component;
    let ready = false;
    let prevData = clone(data);
    let prevStoreData = clone(storeData);

    /*
     * event dispatcher to be used by the Svelte2 component
     * to communicate with the Svelte3 component using it
     */
    const eventDispatch = createEventDispatcher();

    const uid = Math.ceil(Math.random() * 1e5).toString(36);

    function initHooks() {
        const hooks = new Map();
        return {
            register(key, method) {
                if (!hooks.has(key)) hooks.set(key, new Set());
                hooks.get(key).add(method);
            },
            unregister(key) {
                hooks.delete(key);
            },
            call(key) {
                const results = [];
                if (hooks.has(key)) {
                    for (const method of hooks.get(key)) {
                        results.push(method());
                    }
                }
                return { results };
            }
        };
    }

    onMount(async () => {
        // mimic old dw setup
        window.dw = {
            ...dw,
            backend: {
                __messages: $messages,
                __api_domain: $config.apiDomain,
                __userData: $userData,
                hooks:
                    window && window.dw && window.dw.backend && window.dw.backend.hooks
                        ? window.dw.backend.hooks
                        : initHooks()
            }
        };
        window.__svelte2wrapper = window.__svelte2wrapper || {};
        window.__svelte2wrapper[uid] = {
            data: prevData,
            store: {
                ...(storeData || {}),
                eventDispatch,
                getUserData() {
                    return $userData;
                },
                setUserData(data) {
                    $userData = data;
                }
            },
            storeMethods: storeMethods || {}
        };
        waitFor(
            () => !!customElements.get('svelte2-wrapper'),
            () => (ready = true)
        );
    });

    beforeUpdate(() => {
        // notify svelte2 wrapper about data changes from parent component
        const clonedData = clone(data);
        Object.keys(clonedData).forEach(key => {
            if (key.startsWith('$') || prevData[key] === undefined) {
                // ignore stores and all new props
                delete clonedData[key];
            }
        });
        if (!isEqual(prevData, clonedData)) {
            prevData = clonedData;
            waitFor(
                () => component && component.update,
                () => {
                    component.update(prevData);
                }
            );
        }
        // also update if storeData changes
        if (!isEqual(prevStoreData, storeData)) {
            prevStoreData = clone(storeData);
            waitFor(
                () => component && component.update,
                () => {
                    component.update(prevData, prevStoreData);
                }
            );
        }
    });

    function update(event) {
        // TODO: Notice that this is called all the time. Probably because
        // data and event.detail differ, e.g. in data.settings.defaultTheme
        // vs data.settings.default_theme.
        // notify parent component about data changes from svelte2 wrapper
        const cloned = clone(event.detail);
        let fireUpdate = false;
        if (!isEqual(data, cloned.data)) {
            data = cloned.data;
            fireUpdate = true;
        }
        if (!isEqual(storeData, cloned.store)) {
            storeData = cloned.store;
            fireUpdate = true;
        }
        fireUpdate && eventDispatch('update', cloned);
    }
</script>

{#if ready}
    <svelte2-wrapper
        bind:this={component}
        {uid}
        {id}
        {js}
        {css}
        {module}
        on:update={update}
        on:change
        on:state
        on:init
    />
{/if}
