<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    export let value = '';
    export let id = '';
    export let uid = '';
    export let ariaLabel = null;
    export let autocomplete = 'off';
    export let disabled = false;
    export let readonly = false;

    /**
     * expandable TextInput fields turn are using an automatically
     * resizing <textarea> which looks like a <input type="text" />
     */
    export let expandable = false;

    export let placeholder = '';
    export let width = '100%';
    export let height = 20;
    export let textDirection = 'ltr';
    export let error = false;
    export let rows = 5;

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

    /**
     * allow for input to be cleared by clicking on an "✕" icon
     */
    export let deletable = false;

    /**
     * Additional class names for customizing the presentation
     */
    let className = '';
    export { className as class };

    let scroll = false;

    let textarea;
    let input;

    function resize() {
        const { lineHeight } = window.getComputedStyle(textarea);
        const maxHeight = parseInt(lineHeight) * rows;
        const newHeight = getScrollHeight(textarea);
        height = maxHeight < newHeight ? maxHeight : newHeight;
        scroll = maxHeight < newHeight;
    }

    function getScrollHeight(element) {
        const actualHeight = element.style.height; // Store original height of element
        element.style.height = 'auto'; // Set height to 'auto' in order to get actual scroll height
        const scrollHeight = element.scrollHeight - 12; // Deduct 12px to account for padding & borders
        element.style.height = actualHeight; // Reset to original height
        return scrollHeight;
    }

    function clearValue() {
        value = '';
        if (textarea) textarea.focus();
        if (input) input.focus();
    }

    onMount(() => {
        if (expandable) {
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Setting the initial size of the textarea only works correctly
                        // if the element is currently visible.
                        // Using the IntersectionObserver we make sure to only call the
                        // initial resize command when the element first becomes visible.
                        resize();
                        observer.unobserve(textarea);
                    }
                });
            });
            observer.observe(textarea);
        }
    });
</script>

<style>
    .text-container {
        display: flex;
    }

    .clear-button {
        /* make sure clear button is clickable even when input has focus */
        z-index: 5 !important;
        pointer-events: all !important;
        cursor: pointer;
        right: 0;
    }

    input,
    textarea {
        margin: 0 !important;
        width: 100%;
    }

    textarea {
        line-height: 20px !important;
        resize: none;
        overflow: hidden;
        box-sizing: content-box;
    }

    textarea.scroll {
        resize: vertical;
        overflow-y: scroll;
    }

    input[disabled],
    textarea[disabled] {
        cursor: default;
        color: #999;
    }
</style>

<div
    class="control"
    class:is-loading={loading}
    class:has-icons-left={!!icon}
    class:has-icons-right={loading || checked || (!!value && deletable)}
>
    <div class="text-container" style="width:{width}" data-uid={uid}>
        {#if expandable}
            <textarea
                bind:this={textarea}
                class="input {className}"
                class:scroll
                class:is-danger={error}
                aria-label={ariaLabel}
                bind:value
                on:input
                on:input={resize}
                style="height:{height}px"
                dir={textDirection}
                rows="1"
                {id}
                {readonly}
                {disabled}
                {placeholder}
                {autocomplete}
            />
        {:else}
            <input
                bind:this={input}
                type="text"
                class="input {className}"
                class:is-danger={error}
                aria-label={ariaLabel}
                bind:value
                on:input
                {id}
                {readonly}
                {disabled}
                {placeholder}
                {autocomplete}
                dir={textDirection}
            />
        {/if}
        {#if icon}
            <IconDisplay {icon} className="is-left" size="20px" />
        {/if}
        {#if !loading && checked}
            <IconDisplay icon="checkmark-bold" className="is-right" />
        {/if}
        {#if !loading && !!value && deletable}
            <button
                on:click={clearValue}
                class="clear-button icon button is-ghost"
                in:fade={{ duration: 200 }}
            >
                <IconDisplay icon="close-circle" size="16px" color="#a7a7a7" />
            </button>
        {/if}
    </div>
</div>
