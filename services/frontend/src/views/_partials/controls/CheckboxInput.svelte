<script>
    import IconDisplay from '../displays/IconDisplay.svelte';

    /**
     * the checkbox label
     */
    export let label = '';

    /**
     * don't show label
     */
    export let standalone = false;

    /**
     * checked state of the checkbox
     */
    export let value = false;

    /**
     * disabled state
     */
    export let disabled = false;

    /**
     * custom class attribute
     */
    let className = '';
    export { className as class };

    /**
     * @export
     *
     * faded state. A faded checkbox looks like it's disabled
     * but you can still toggle it. Useful for signaling to the
     * user that a certain option isn't available at the moment
     * but still allowing to set the preferred state once it
     * becomes available again
     */
    export let faded = false;
    export let uid;
</script>

<style lang="scss">
    @import '../../../styles/colors.scss';

    .checkbox {
        white-space: nowrap;
        margin-bottom: 0.5em;
        line-height: 1.3;
    }

    .checkbox:not(:last-of-type) {
        margin-right: 1em;
    }

    .is-faded {
        color: $dw-grey-dark;
    }
    .is-faded .checkbox-icon {
        opacity: 0.5;
    }

    .checkbox-label {
        display: inline-block;
        white-space: normal;
        margin-left: 0.25em;
    }
    .checkbox-icon {
        display: inline-block;
        position: relative;
        top: 0.15em;
        width: 1.25em;
        height: 1.25em;
        border-radius: 2px;
        border: 1px solid $dw-grey;
        font-size: 0.8em;
        text-align: center;
        vertical-align: top;
    }
    input[type='checkbox'] {
        opacity: 0 !important; // hide default checkbox
        pointer-events: none;
        position: absolute;
        display: inline-block;
    }

    input[type='checkbox']:checked + .checkbox-icon {
        background: $dw-scooter-light;
        border-color: $dw-scooter-light;
    }
    input[type='checkbox']:focus + .checkbox-icon {
        border-color: $dw-scooter-light;
        box-shadow: 0 0 1px 1px fade($dw-scooter-light, 55%);
    }
    input[type='checkbox']:disabled + .checkbox-icon {
        border-color: $dw-grey;
        background: $dw-grey-lighter;
        cursor: inherit;
        opacity: 0.6;
    }
    input[type='checkbox']:disabled:checked + .checkbox-icon {
        border-color: $dw-grey;
        background: $dw-grey;
    }
</style>

<label
    class="checkbox {className}"
    class:is-faded={faded}
    disabled={disabled || null}
    data-uid={uid}
>
    <input
        type="checkbox"
        aria-label={label || null}
        disabled={disabled || null}
        bind:checked={value}
        on:change
        on:click
    />
    <span class="checkbox-icon">
        {#if value}
            <IconDisplay icon="checkmark-bold" color="white" valign="top" />
        {/if}
    </span>
    {#if !standalone}<span class="checkbox-label">{label}</span>{/if}
</label>
