<script>
    import HelpDisplay from './HelpDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { getContext } from 'svelte';

    const msg = getContext('messages');

    let __;
    $: {
        __ = (key, scope = 'core') => msg.translate(key, scope, $msg);
    }

    export let error = null;
    export let id = null;
    export let loading = false;
    export let checked = false;
    export let label = null;
    export let compact = false;
    export let help = '';
</script>

<style>
    .field {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    .field.compact {
        margin-bottom: 0.5em;
    }
    .field.compact .label {
        font-weight: normal;
    }
    .field.compact .label:not(:last-child) {
        margin-bottom: 0;
    }
    .control {
        flex-basis: 100%;
    }
</style>

<div class="field" on:input class:compact>
    {#if label}
        <label for={id} class="label">{label}<slot name="labelExtra" /></label>
    {/if}
    {#if help}
        <HelpDisplay inline>
            <div>{@html help}</div>
        </HelpDisplay>
    {/if}
    <div class="control" class:is-loading={loading} class:has-icons-right={checked}>
        <slot {id} />
        {#if checked}
            <IconDisplay icon="checkmark-bold" className="is-right" />
        {/if}
    </div>
    {#if error}
        <p class="help is-danger">
            {__('Error:')}
            {error}
        </p>
    {/if}
</div>
