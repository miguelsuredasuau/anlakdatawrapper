<script>
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
    label.faded {
        color: $dw-grey-dark;
    }

    label.faded .css-ui {
        opacity: 0.5;
    }
    input[type='checkbox'] {
        float: none;
        opacity: 0 !important;
        pointer-events: none;
        position: absolute;
        display: inline-block;
        vertical-align: sub;
    }
    input[type='checkbox'] + span.css-ui {
        display: inline-block;
        width: 1em;
        height: 1em;
        border-radius: 2px;
        border: 1px solid $dw-grey;
        vertical-align: baseline;
        position: relative;
        top: 2px;

        .standalone & {
            top: 0;
            margin-left: 0;
        }
    }
    input[type='checkbox']:checked + span.css-ui {
        background: $dw-scooter-light;
        border-color: $dw-scooter-light;
    }
    input[type='checkbox']:checked + span.css-ui:after {
        position: absolute;
        display: block;
        color: white;
        left: 0.15em;
        top: 0.4em;
        font-weight: bold;
        content: '\e023';
        font-family: 'iconmonstr-iconic-font';
        font-size: 0.65em;
        line-height: 0.8em;
    }
    input[type='checkbox']:focus + span.css-ui {
        border-color: $dw-scooter-light;
        box-shadow: 0 0 1px 1px fade($dw-scooter-light, 55%);
    }
    input[type='checkbox']:disabled + span.css-ui {
        background: $dw-grey-dark;
        border-color: $dw-grey;
        cursor: default;
        opacity: 0.6;
    }
    input[type='checkbox']:disabled:checked + span.css-ui {
        border-color: $dw-grey;
        background: $dw-grey;
    }

    .checkbox {
        margin: 0 0 0.15em 0;
    }

    .checkbox:not(:last-of-type) {
        margin-right: 1em;
    }
    .checkbox-label {
        margin-left: 0.25em;
    }
</style>

<label class="checkbox" disabled={disabled || null} class:faded data-uid={uid}>
    <input
        type="checkbox"
        aria-label={label || null}
        disabled={disabled || null}
        bind:checked={value}
        on:change
        on:click
    />
    <span class="css-ui" />
    {#if !standalone}<span class="checkbox-label">{label}</span>{/if}
</label>
