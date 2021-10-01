<script>
    import { __ } from '@datawrapper/shared/l10n.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let value = false;
    export let bottomLine = false;
    export let disabled = false;
    let className = '';
    export { className as class };
    export let showLabel = __('controls / more-options');
    export let hideLabel = __('controls / fewer-options');
    export let uid;

    function toggle() {
        if (disabled) return;
        value = !value;
        dispatch('change', { value });
    }
</script>

<style type="text/css">
    .more-options-toggle button {
        position: relative;
        left: -6px;
        border: 0;
        padding: 1px 6px;
        background: transparent;
    }
    .more-options-toggle button .icon {
        width: 0.7em;
        height: 0.7em;
        margin-right: 0.2em;
        transition: transform 0.25s;
    }
    .more-options-content {
        padding-left: 1.2em;
        clear: both;
    }
    .more-options-visible button .icon {
        transform: rotate(90deg);
        transform-origin: 50% 45%;
    }
    .disabled {
        cursor: pointer;
        opacity: 0.5;
        pointer-events: none;
    }
</style>

<div
    data-uid={uid}
    class:disabled
    class="control-group vis-option-group vis-option-type-more-options {className || ''}"
>
    <div
        class="more-options-toggle mb-2"
        class:more-options-visible={value}
        class:more-options-hidden={!value}
    >
        <button on:click={toggle} on:mousedown|preventDefault>
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                class="icon"
            >
                <path d="M5 22L22 12L5 2V22Z" />
            </svg>
            {value ? hideLabel : showLabel}
        </button>
    </div>
    {#if value}
        <div class="more-options-content pb-3">
            <slot />
        </div>
        {#if bottomLine}
            <hr class="mt-0 mb-2" />
        {/if}
    {/if}
</div>
