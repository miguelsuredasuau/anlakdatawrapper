<script>
    import { onMount, getContext, beforeUpdate } from 'svelte';
    import clone from '@datawrapper/shared/clone';
    import isEqual from 'underscore/modules/isEqual.js';

    export let id;
    export let js;
    export let css;
    export let data;
    export let storeData;

    const messages = getContext('messages');
    const config = getContext('config');
    const userData = getContext('userData');

    let component;
    let ready = false;
    let _data = clone(data);

    const uid = Math.ceil(Math.random() * 1e5).toString(36);

    onMount(async () => {
        // mimic old dw setup
        window.dw = {
            backend: {
                __messages: $messages,
                __api_domain: $config.apiDomain,
                __userData: $userData
            }
        };
        window.__svelte2wrapper = window.__svelte2wrapper || {};
        window.__svelte2wrapper[uid] = {
            data: _data,
            store: storeData
        };
        wait();
    });

    function wait() {
        if (!customElements.get('svelte2-wrapper')) return setTimeout(wait, 100);
        ready = true;
    }

    beforeUpdate(() => {
        // notify svelte2 wrapper about data changes from parent component
        // @todo: also update if storeData changes
        const clonedData = clone(data);
        Object.keys(clonedData).forEach(key => {
            if (key.startsWith('$') || _data[key] === undefined) {
                // ignore stores and all new props
                delete clonedData[key];
            }
        });
        if (!isEqual(_data, clonedData)) {
            _data = clonedData;
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
        {uid}
        {id}
        {js}
        {css}
        on:update={update}
        on:change
        on:init
    />
{/if}
