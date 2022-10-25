<svelte:options tag="svelte2-wrapper" />

<script>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { get_current_component as getCurrentComponent } from 'svelte/internal';
    import { loadScript } from '@datawrapper/shared/fetch.js';
    import { waitFor } from './shared';

    const svelteDispatch = createEventDispatcher();
    const component = getCurrentComponent();
    const dispatch = (name, detail) => {
        svelteDispatch(name, detail);
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }));
    };

    export let id;
    export let uid;
    export let js;
    export let css;
    export let module;

    // a set of property keys whose corresponding property changes
    // we want to propagate to the parent component
    let externalProperties = new Set();
    function filterOutInternalProps(data) {
        return Object.fromEntries(
            Object.entries(data).filter(([prop]) => externalProperties.has(prop))
        );
    }

    export function update(data, storeData) {
        waitFor(
            () => _app,
            () => _app.set(data)
        );
        waitFor(
            () => storeInitialized,
            () => _store && storeData && _store.set(storeData)
        );
    }

    let container;
    let parent;
    let loading = true;

    let _app;
    let _store;
    let storeInitialized = false;

    function loadCSS(src) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = src;
            link.onload = () => {
                resolve();
            };
            link.onerror = reject;
            parent.appendChild(link);
        });
    }

    onMount(async () => {
        await Promise.all([
            loadCSS('/static/vendor/bootstrap/css/bootstrap.css'),
            loadCSS('/static/vendor/bootstrap/css/bootstrap-responsive.css'),
            loadCSS('/static/vendor/font-awesome/css/font-awesome.min.css'),
            loadCSS('/static/vendor/iconicfont/css/iconmonstr-iconic-font.min.css'),
            loadCSS('/static/css/datawrapper.css'),
            loadCSS('/lib/static/css/bulma-polyfill.css'),
            loadScript(js),
            ...(Array.isArray(css) ? css.map(loadCSS) : [loadCSS(css)])
        ]);

        require([id], bundle => {
            const { store } = bundle;
            try {
                loading = false;
                if (store && window.__svelte2wrapper[uid].store) {
                    store.set(window.__svelte2wrapper[uid].store);
                    _store = store;
                }
                if (store && window.__svelte2wrapper[uid].storeMethods) {
                    Object.assign(store, window.__svelte2wrapper[uid].storeMethods);
                }

                storeInitialized = true;

                if (!bundle[module]) {
                    loading = false;
                    return;
                }

                const initialProps = window.__svelte2wrapper[uid].data;
                externalProperties = new Set(Object.keys(initialProps));
                _app = new bundle[module]({
                    target: container,
                    store,
                    data: initialProps
                });

                if (store) {
                    store.on('state', () => {
                        dispatch('update', {
                            data: filterOutInternalProps(window.__svelte2wrapper[uid].data),
                            store: store.get()
                        });
                    });
                }
                _app.on('state', ({ current, changed }) => {
                    // forward the raw state event to allow a consuming
                    // component to watch changes to computed properties
                    dispatch('state', { current, changed });
                    window.__svelte2wrapper[uid].data = current;
                    dispatch('update', {
                        data: filterOutInternalProps(current),
                        ...(store ? { store: store.get() } : {})
                    });
                });
                _app.on('change', event => {
                    dispatch('change', event);
                });
                // store app reference for client-side hooks
                bundle.app = _app;
                dispatch('init', _app);
            } catch (err) {
                console.error(err);
                dispatch('error', err);
            }
        });
    });

    onDestroy(() => {
        container.innerHTML = '';
    });
</script>

<style lang="less">
    .svelte-2 {
        position: relative;

        .loading {
            color: #888;
        }
    }
</style>

<div class="visconfig dw-create-visualize chart-editor" bind:this={parent}>
    <div class="vis-options">
        <div class="svelte-2" bind:this={container}>
            {#if loading}<span class="loading">loading...</span>{/if}
        </div>
    </div>
</div>
