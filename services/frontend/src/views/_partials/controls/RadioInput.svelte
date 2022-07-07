<script>
    /**
     * array of available options as { value, label } pairs
     */
    export let options = []; //

    /**
     * the currently selected value
     */
    export let value;

    /**
     * disabled state
     */
    export let disabled = false;

    /**
     * set to false to display radio options
     * as block items
     */
    export let inline = true;
</script>

<style lang="scss">
    @import '../../../styles/export.scss';

    input[type='radio'] {
        float: none;
        opacity: 0 !important;
        pointer-events: none;
        position: absolute;
        left: -10000px;
        display: inline-block;
        vertical-align: sub;

        & + span.css-ui {
            display: inline-block;
            width: 1em;
            height: 1em;
            border-radius: 50%;
            vertical-align: baseline;
            box-sizing: border-box;
            position: relative;
            margin-right: 0.15rem;
            top: 2px;
            border: 1px solid $dw-grey-dark;
        }
    }

    input[type='radio']:checked + span.css-ui {
        background: white;
        border-color: $dw-scooter-light;
        border-width: 4px;
    }
    input[type='radio']:focus + span.css-ui {
        border-color: $dw-scooter-light;
        box-shadow: 0 0 1px 1px rgba(24, 161, 205, 0.55);
    }
    input[type='radio']:disabled + span.css-ui {
        background: $dw-grey-light;
        border-color: $dw-grey;
        cursor: default;
        opacity: 0.6;
    }
    .indeterminate input[type='radio'] + span.css-ui {
        border-color: fade($dw-scooter-light, 55%);
        background: fade($dw-scooter-light, 55%);
        border-width: 4px;
    }
    .indeterminate input[type='radio'] + span.css-ui:after {
        content: '';
        position: absolute;
        display: block;
        background: white;
        left: calc(50% - 0.6ex);
        top: calc(50% - 1px);
        height: 2px;
        width: 1.2ex;
    }
    input[type='radio']:disabled:checked + span.css-ui {
        border-color: $dw-grey-dark;
        background: $dw-grey-dark;
    }

    .control:not(.inline) label.radio {
        display: block;
    }
    .control:not(.inline) .radio + .radio {
        margin-left: 0;
    }
</style>

<div class="control" class:inline>
    {#each options as opt}
        <label class="radio" disabled={disabled || null}>
            <input
                type="radio"
                disabled={disabled || null}
                on:change
                bind:group={value}
                value={opt.value}
            />
            <span class="css-ui" />&nbsp;{opt.label}
        </label>
    {/each}
</div>
