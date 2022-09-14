<script>
    /**
     * the checkbox label
     */
    export let label = '';

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

<style>
    label.checkbox {
        text-align: left;
        width: 100%;
        position: relative;
        left: 0;
    }

    label.checkbox.disabled,
    label.checkbox.faded {
        color: #999;
    }

    label.checkbox.disabled input,
    label.checkbox.faded {
        opacity: 0.5;
    }

    label.checkbox.disabled input,
    label.checkbox.faded input {
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
        width: 0.85em;
        height: 0.85em;
        border-radius: 2px;
        border: 1px solid #bbb;
        vertical-align: baseline;
        position: relative;
        top: 2px;
        margin-left: -16px;
    }
    input[type='checkbox']:checked + span.css-ui {
        background: #18a1cd;
        border-color: #18a1cd;
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
        border-color: #18a1cd;
        box-shadow: 0 0 1px 1px fade(#18a1cd, 55%);
    }
    input[type='checkbox']:disabled + span.css-ui {
        background: #ddd;
        border-color: #bbb;
        cursor: default;
        opacity: 0.6;
    }
    input[type='checkbox']:disabled:checked + span.css-ui {
        border-color: #bbb;
        background: #bbb;
    }
</style>

<div class="control-group vis-option-group vis-option-type-checkbox" data-uid={uid}>
    <label class="checkbox" class:disabled class:faded>
        <input type="checkbox" {disabled} bind:checked={value} on:change />
        <span class="css-ui" />
        {label}
    </label>
</div>
