<script>
    import { onMount, getContext, beforeUpdate, createEventDispatcher } from 'svelte';
    import clone from '@datawrapper/shared/clone';
    import isEqual from 'underscore/modules/isEqual.js';
    import { loadScript, loadStylesheet } from '@datawrapper/shared/fetch';

    export let id;
    export let js;
    export let css;
    export let data;
    export let storeData;

    const messages = getContext('messages');
    const config = getContext('config');

    const dispatch = createEventDispatcher();

    let component;
    let container;
    let ready = false;
    let isIE = false;
    let _data = clone(data);
    let _app;

    onMount(async () => {
        // mimic old dw setup
        window.dw = {
            backend: {
                __messages: $messages,
                __api_domain: $config.apiDomain
            }
        };

        isIE = !!window.document.documentMode;
        if (isIE) {
            // Internet Explorer compatibility
            await Promise.all([
                loadStylesheet('/static/vendor/bootstrap/css/bootstrap.css'),
                loadStylesheet('/static/vendor/bootstrap/css/bootstrap-responsive.css'),
                loadStylesheet('/static/vendor/font-awesome/css/font-awesome.min.css'),
                loadStylesheet('/static/vendor/iconicfont/css/iconmonstr-iconic-font.min.css'),
                loadStylesheet('/static/css/datawrapper.css'),
                loadScript(js),
                loadStylesheet(css)
            ]);
            require([id], ({ App, store }) => {
                try {
                    _app = new App({
                        target: container,
                        store,
                        data
                    });
                    _data = clone(data);
                    if (store && storeData) {
                        store.set(storeData);
                    }
                    _app.on('change', event => {
                        dispatch('change', event);
                    });
                    _app.on('state', ({ current }) => {
                        // TODO Process current with filterOutComputedProps().
                        data = clone(current);
                    });
                } catch (err) {
                    console.error('x', err);
                }
            });
        } else {
            if (!customElements.get('svelte2-wrapper')) {
                // only define svelte2-wrapper once
                await loadScript('/lib/csr/_partials/svelte2/Svelte2Wrapper.element.svelte.js');
                setTimeout(() => {
                    ready = true;
                }, 100);
            } else {
                ready = true;
            }
        }
    });

    beforeUpdate(() => {
        // notify svelte2 wrapper about data changes from parent component
        // @todo: also update if storeData changes
        if (!isEqual(_data, data)) {
            _data = clone(data);
            if (isIE) {
                if (_app) {
                    _app.set(data);
                }
            } else {
                if (component && component.update) {
                    component.update(_data);
                }
            }
        }
    });

    function update(event) {
        // TODO Notice that this is called all the time. Probably because data and event.detail differ, e.g. in data.settings.defaultTheme vs data.settings.default_theme.
        // notify parent component about data changes from svelte2 wrapper
        data = clone(event.detail);
    }
</script>

<style>
    :global(.vis-option-type-switch) {
        position: relative;
    }
</style>

{#if isIE}
    <div class="svelte-2" bind:this={container} />
{:else if ready}
    <svelte2-wrapper
        bind:this={component}
        {id}
        {js}
        {css}
        on:update={update}
        on:change
        data={JSON.stringify(data)}
        storeData={JSON.stringify(storeData)}
    />
{/if}
