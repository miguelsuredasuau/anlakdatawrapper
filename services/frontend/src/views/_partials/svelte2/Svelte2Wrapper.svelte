<script>
    import { onMount, getContext, beforeUpdate } from 'svelte';
    import clone from '@datawrapper/shared/clone';
    import isEqual from 'underscore/modules/isEqual.js';
    import { loadScript } from '@datawrapper/shared/fetch';

    export let id;
    export let js;
    export let css;
    export let data;
    export let storeData;

    const messages = getContext('messages');
    const config = getContext('config');

    let component;
    let ready = false;
    let _data = clone(data);

    onMount(async () => {
        // mimic old dw setup
        window.dw = {
            backend: {
                __messages: $messages,
                __api_domain: $config.apiDomain
            }
        };

        if (!customElements.get('svelte2-wrapper')) {
            // only define svelte2-wrapper once
            await loadScript('/lib/csr/_partials/svelte2/Svelte2Wrapper.element.svelte.js');
            setTimeout(() => {
                ready = true;
            }, 100);
        } else {
            ready = true;
        }
    });

    beforeUpdate(() => {
        // notify svelte2 wrapper about data changes from parent component
        // @todo: also update if storeData changes
        if (!isEqual(_data, data)) {
            _data = clone(data);
            if (component && component.update) {
                component.update(_data);
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

{#if ready}
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
