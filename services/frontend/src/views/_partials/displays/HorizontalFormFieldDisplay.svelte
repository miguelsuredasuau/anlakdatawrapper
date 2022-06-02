<script>
    import FormFieldDisplay from './FormFieldDisplay.svelte';
    import HelpDisplay from './HelpDisplay.svelte';
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
    .field.compact {
        margin-bottom: 0.5em;
    }
    .field.compact .label {
        font-weight: normal;
    }
    .field.compact .label:not(:last-child) {
        margin-bottom: 0;
    }
    .field-label {
        text-align: left;
    }
    .field-body {
        flex-grow: 3;
    }
    .field-help {
        width: 2em;
        text-align: center;
    }
</style>

<div class="field is-horizontal" on:input class:compact>
    {#if label}
        <div class="field-label">
            <label for={id} class="label">{label}</label>
        </div>
    {/if}
    <div class="field-body">
        <FormFieldDisplay {loading} {checked} {id} {error} {compact}>
            <slot {id} />
        </FormFieldDisplay>
    </div>
    <div class="field-help">
        {#if help}
            <HelpDisplay inline>
                <div>{@html help}</div>
            </HelpDisplay>
        {/if}
    </div>
</div>
