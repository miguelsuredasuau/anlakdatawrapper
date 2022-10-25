<script>
    import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import HelpDisplay from '../displays/HelpDisplay.svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';

    const dispatch = createEventDispatcher();

    export let label;
    export let value = false;
    export let tooltip = '';
    export let tooltipType = null;
    export let tooltipPlacement = 'right';
    export let disabledMessage = '';
    export let disabledState = 'auto';
    export let disabled = false;
    export let inverted = false;
    export let indeterminate = false;
    export let uid = null;

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
    .switch {
        padding: 3px 0;
        transition: height 0.2s ease-out;
    }

    :global(.switch + .switch) {
        border-top: 1px solid var(--color-dw-grey-lighter);
        margin-top: -0.75rem;
    }

    .switch-content {
        padding: 4px 0 4px 40px;
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
        color: var(--color-dw-grey);
        line-height: 1.2;
        padding: 0 0 5px 40px;
    }

    /* The switch - the box around the slider */
    .switch-btn {
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

    /* Hide default HTML checkbox */
    .switch-btn input {
        display: none;
    }

    .switch-outer {
        display: block;
        position: relative;
        padding: 4px 0 4px 40px;
        cursor: pointer;
        max-width: calc(100% - 60px);
    }

    .switch-outer.disabled,
    .switch-outer.disabled * {
        color: var(--color-dw-grey-dark);
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
        background-color: var(--color-dw-scooter-light);
    }

    input:checked:disabled + .slider:before {
        background-color: #ededed;
    }

    input:checked:disabled:not(.disabled-force-checked) + .slider {
        background-color: #ccc;
    }

    input:disabled.disabled-force-checked + .slider {
        background-color: #999;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px var(--color-dw-scooter-light);
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

<div class="field switch" data-uid={uid}>
    {#if tooltip || $$slots.tooltip}
        <HelpDisplay float type={tooltipType} placement={tooltipPlacement}>
            {#if tooltip}
                <div>{@html purifyHtml(tooltip)}</div>
            {/if}
            <slot name="tooltip" />
        </HelpDisplay>
    {/if}

    <label class="switch-outer" class:disabled>
        <button on:click={toggle} class="switch-btn">
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
        {@html purifyHtml(label)}
    </label>

    {#if disabled && disabledMessage}
        <div transition:slide>
            <div class="disabled-msg">
                {@html purifyHtml(disabledMessage)}
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
