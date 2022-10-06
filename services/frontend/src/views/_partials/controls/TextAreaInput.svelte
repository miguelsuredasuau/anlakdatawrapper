<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    export let value = '';
    export let id = '';
    export let uid = '';
    export let autocomplete = 'off';
    export let ariaLabel = null;
    export let readonly = false;
    export let disabled = false;

    export let placeholder = '';
    export let width = '100%';
    export let height = 'auto';
    export let resize = 'both';
    export let textDirection = 'ltr';

    /**
     * optional icon to be displayed on the left side
     * input
     */
    export let icon = null;

    /**
     * optional checked state, e.g. to indicate that a change
     * has been saved
     */
    export let checked = false;

    /**
     * to indicate that the text input is waiting for some
     * server response etc.
     */
    export let loading = false;

    let className;
    export { className as class };
</script>

<style>
    textarea {
        margin: 0;
        width: 100%;
        box-sizing: border-box;
        line-height: 1.5em !important;
    }
</style>

<div
    data-uid={uid}
    class="control"
    class:is-loading={loading}
    class:has-icons-left={!!icon}
    class:has-icons-right={loading || checked}
    style="width:{width}"
>
    <textarea
        class="input {className}"
        bind:value
        aria-label={ariaLabel}
        style="height:{height};resize:{resize}"
        dir={textDirection}
        {id}
        {readonly}
        {disabled}
        {placeholder}
        {autocomplete}
    />
    {#if icon}
        <IconDisplay {icon} className="is-left" size="20px" />
    {/if}
    {#if !loading && checked}
        <IconDisplay icon="checkmark-bold" className="is-right" />
    {/if}
</div>
