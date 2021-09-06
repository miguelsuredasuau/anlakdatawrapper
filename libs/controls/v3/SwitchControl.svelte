<script>
    /* eslint-disable import/first */
    import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import HelpDisplay from './HelpDisplay.svelte';

    const dispatch = createEventDispatcher();

    export let label;
    export let value = false;
    export let help = '';
    export let disabledMessage = '';
    export let disabledState = 'auto';
    export let disabled = false;
    export let inverted = false;
    export let indeterminate = false;

    $: effectiveValue = inverted ? !value : value;

    function toggle() {
        if (disabled) return;
        if (indeterminate) {
            if (!value) {
                // normal switch default to `true`, inverted switch default to `false`
                value = !inverted;
            }
            indeterminate = false;
        } else {
            value = !value;
        }
        dispatch('toggle', value);
    }
</script>

<style>
    .vis-option-type-switch {
        padding: 4px 0;
        transition: height 0.2s ease-in-out;
        background: #ffffff00;
    }

    :global(.vis-option-type-switch + .vis-option-type-switch) {
        border-top: 1px solid #ddd;
    }

    .switch-content {
        position: relative;
        top: 3px;
        padding-left: 40px;
    }

    /* Prevents display issues with floated content & makes transition smoother: */
    .switch-content::after {
        content: '';
        clear: both;
        display: table;
    }

    .disabled-msg {
        overflow: hidden;
        font-size: 11px;
        font-style: italic;
        color: #a8a8a8;
        line-height: 1.2;
        padding: 0 0 5px 40px;
    }

    /* The switch - the box around the slider */
    .switch {
        position: absolute;
        display: inline-block;
        width: 30px;
        left: 2px;
        top: 7px;
        height: 16px;
        -webkit-appearance: none;
        border: 0;
        background: none;
    }

    .switch:focus {
        outline: 1px dotted #222;
    }

    /* Hide default HTML checkbox */
    .switch input {
        display: none;
    }

    .switch-outer {
        display: inline-block;
        position: relative;
        padding: 7px 0 7px 40px;
        max-width: calc(100% - 60px);
        cursor: pointer;
    }

    .switch-outer.disabled,
    .switch-outer.disabled * {
        color: #888;
        cursor: default;
    }

    /* The slider */
    .slider {
        border-radius: 16px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.2s;
    }

    .slider:before {
        border-radius: 50%;
        position: absolute;
        content: '';
        height: 12px;
        width: 12px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: 0.2s ease-in-out;
    }

    input:checked + .slider {
        background-color: #18a1cd;
    }

    input:checked:disabled + .slider {
        background-color: #ccc;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #18a1cd;
    }

    input.disabled-force-checked + .slider:before,
    input:checked + .slider:before {
        transform: translateX(13px);
    }

    input.disabled-force-unchecked + .slider:before {
        transform: translateX(0px);
    }

    input:indeterminate + .slider:before {
        transform: translateX(7px);
    }

    input:indeterminate + .slider {
        background-color: #96d2e6;
    }
</style>

<div class="vis-option-type-switch">
    {#if help}
        <HelpDisplay>
            <div>{@html help}</div>
        </HelpDisplay>
    {/if}

    <label class="switch-outer" class:disabled>
        <button on:click={toggle} class="switch">
            <input
                class:disabled-force-checked={disabled && disabledState === 'on'}
                class:disabled-force-unchecked={disabled && disabledState === 'off'}
                {disabled}
                checked={effectiveValue}
                {indeterminate}
                type="checkbox"
            />
            <span class="slider" />
        </button>
        {@html label}
    </label>

    {#if disabled && disabledMessage}
        <div transition:slide>
            <div class="disabled-msg">
                {@html disabledMessage}
            </div>
        </div>
    {:else}
        <!-- Render content only if slot content is set & control isn't disabled -->
        {#if $$slots.default && (!disabled || disabledState === 'on') && effectiveValue && !indeterminate}
            <div transition:slide on:outroend class="switch-content">
                <slot />
            </div>
        {/if}
    {/if}
</div>
