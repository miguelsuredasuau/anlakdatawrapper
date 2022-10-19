<script>
    function onChange() {
        if (indeterminate) {
            indeterminate = false;
        }
    }
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

    /**
     * set to true to show a radio that's undecided
     * about which value is selected
     */
    export let indeterminate = false;
</script>

<style lang="scss">
    @import '../../../styles/export.scss';

    $dw-radio-border-width: 0.25em;

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
            top: 0.15em;
            border: 1px solid $dw-grey-dark;
        }
    }

    input[type='radio']:checked + span.css-ui {
        background: white;
        border-color: $dw-scooter-light;
        border-width: $dw-radio-border-width;
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

    $indeterminate-dash-width: 0.15em;

    .indeterminate {
        input[type='radio'] + span.css-ui,
        input[type='radio']:checked + span.css-ui {
            border-color: rgba($dw-scooter-light, 40%);
            background: rgba($dw-scooter-light, 40%);
            border-width: $dw-radio-border-width * 2;
        }

        input[type='radio'] + span.css-ui:after {
            content: '';
            position: absolute;
            display: block;
            background: white;
            left: calc(50% - 0.6ex);
            top: calc(50% - ($indeterminate-dash-width * 0.5));
            height: $indeterminate-dash-width;
            width: 1.2ex;
        }
    }

    input[type='radio']:disabled:checked + span.css-ui {
        border-color: $dw-grey-dark;
        background: $dw-grey-dark;
    }

    .radio {
        margin: 0 0 0.15em 0;
    }

    .radio:not(:last-of-type) {
        margin-right: 1em;
    }

    .control:not(.inline) .radio {
        display: block;
    }

    .radio-label {
        margin-left: 0.25em;
    }
</style>

<div class="control" class:inline class:indeterminate>
    {#each options as opt}
        <label class="radio" disabled={disabled || null}>
            <input
                type="radio"
                disabled={disabled || null}
                on:change
                on:change={onChange}
                on:click={onChange}
                bind:group={value}
                value={opt.value}
            />
            <span class="css-ui" />
            <span class="radio-label">{opt.label}</span>
        </label>
    {/each}
</div>
