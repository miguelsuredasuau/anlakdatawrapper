<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    export let __;

    export let error = null;
    export let id = null;
    export let loading = false;
    export let checked = false;
    export let label = null;
</script>

<div class="field" on:input>
    {#if label}
        <label for={id} class="label">{label}</label>
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
