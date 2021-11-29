<!-- eslint-disable-next-line -->
<svelte:options tag="svelte2-wrapper" />

<script>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { get_current_component as getCurrentComponent } from 'svelte/internal';
    import { loadScript } from '@datawrapper/shared/fetch';

    const svelteDispatch = createEventDispatcher();
    const component = getCurrentComponent();
    const dispatch = (name, detail) => {
        svelteDispatch(name, detail);
        component.dispatchEvent && component.dispatchEvent(new CustomEvent(name, { detail }));
    };

    export let id;
    export let js;
    export let css;
    export let data;
    export let storeData = {};

    function isComputedProp(app, prop) {
        try {
            app._checkReadOnly({ [prop]: true });
            return false;
        } catch (ex) {
            return true;
        }
    }

    function filterOutComputedProps(app, data) {
        return Object.fromEntries(
            Object.entries(data).filter(([prop]) => !isComputedProp(app, prop))
        );
    }

    export function update(data, storeData) {
        if (_app) {
            _app.set(data);
        }
        if (_store && storeData) {
            _store.set(storeData);
        }
    }

    let _data;

    let container;
    let parent;
    let loading = true;

    let _app;
    let _store;

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
            loadScript(js),
            loadCSS(css)
        ]);

        const style = document.createElement('style');
        style.innerText = `
    .vis-option-type-switch {
        position: relative;
    }`;
        parent.appendChild(style);

        require([id], ({ App, store }) => {
            try {
                loading = false;
                _app = new App({
                    target: container,
                    store,
                    data: JSON.parse(data)
                });
                if (store) {
                    store.set(storeData);
                    _store = store;
                }
                _data = data;
                _app.on('state', ({ current }) => {
                    data = current;
                    dispatch('update', filterOutComputedProps(_app, current));
                });
                _app.on('change', event => {
                    dispatch('change', event);
                });
            } catch (err) {
                console.error(err);
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

<div class="visconfig" bind:this={parent}>
    <div class="svelte-2" bind:this={container}>
        {#if loading}<span class="loading">loading...</span>{/if}
    </div>
</div>
