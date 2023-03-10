<script>
    import ControlGroup from './ControlGroup.svelte';

    export let options;
    export let disabled = false;
    export let disabledMessage = '';
    export let help = null;
    export let indeterminate = false;
    export let inline = true;
    export let label = '';
    export let labelWidth = 'auto';
    export let miniHelp = null;
    export let valign = 'top';
    export let value = null;
    export let uid;

    const prevState = {
        value
    };

    $: if (value !== prevState.value) {
        indeterminate = false;
        prevState.value = value;
    }
</script>

<style>
    .disabled-message {
        position: relative;
        top: -5px;
        padding: 0 0 5px 0;
        font-size: 12px;
        line-height: 14px;
        font-style: italic;
        color: #999;
    }
    label {
        padding-right: 0.5em;
        padding-bottom: 0.25em;
    }
    label.disabled {
        color: #999;
        cursor: default;
    }
    label.disabled input {
        opacity: 0.5;
    }
    label.has-help > .inner-label {
        border-bottom: 1px dotted #18a1cd;
    }
    label.has-help:hover > .inner-label {
        border-bottom: 2px solid #18a1cd;
    }
    label .help {
        font-weight: 400;
        position: absolute;
        top: 24px;
        padding: 8px 10px 8px 10px;
        background: #18a1cd;
        color: #f9f9f9;
        width: 180px;
        border-radius: 4px;
        box-shadow: 3px 2px 2px rgba(0, 0, 0, 0.1);
        z-index: 8000;
        opacity: 0;
        transition: 0s opacity;
        pointer-events: none;
    }
    label:hover .help {
        opacity: 1;
        transition-delay: 0.4s;
        transition-duration: 0.3s;
        pointer-events: all;
    }
    input[type='radio'] {
        float: none;
        opacity: 0 !important;
        pointer-events: none;
        position: absolute;
        left: -10000px;
        display: inline-block;
        vertical-align: sub;
    }
    input[type='radio'] + span.css-ui {
        display: inline-block;
        width: 1em;
        height: 1em;
        border-radius: 50%;
        border: 1px solid #bbb;
        vertical-align: baseline;
        box-sizing: border-box;
        position: relative;
        margin-right: 0.15rem;
        top: 2px;
    }
    input[type='radio']:checked + span.css-ui {
        background: white;
        border-color: #18a1cd;
        border-width: 4px;
    }
    input[type='radio']:focus + span.css-ui {
        border-color: #18a1cd;
        box-shadow: 0 0 1px 1px rgba(24, 161, 205, 0.55);
    }
    input[type='radio']:disabled + span.css-ui {
        background: #ddd;
        border-color: #bbb;
        cursor: default;
        opacity: 0.6;
    }
    .indeterminate input[type='radio'] + span.css-ui {
        border-color: #96d2e6;
        background: #96d2e6;
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
        border-color: #bbb;
        background: #bbb;
    }
    .inline label {
        display: inline-block;
        margin-right: 1em;
    }
    .inline label:last-of-type {
        margin-right: 0;
        padding-right: 0;
    }
</style>

<ControlGroup type="radio" {labelWidth} {valign} {label} {disabled} {help} {miniHelp} {uid}>
    <div class:inline class:indeterminate>
        {#each options as opt}
            <label title={opt.tooltip || ''} class:disabled class:has-help={opt.help}>
                <input type="radio" value={opt.value} bind:group={value} {disabled} on:change />
                <span class="css-ui" />&nbsp;<span class="inner-label">
                    {@html opt.label}
                </span>
                {#if opt.help}
                    <div class="help">
                        {@html opt.help}
                    </div>
                {/if}
            </label>
        {/each}
    </div>
    <slot />
</ControlGroup>

{#if disabled && disabledMessage}
    <div class="disabled-message">
        {@html disabledMessage}
    </div>
{/if}
