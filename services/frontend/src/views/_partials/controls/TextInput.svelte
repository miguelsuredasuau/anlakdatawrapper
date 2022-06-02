<script>
    import { onMount } from 'svelte';

    export let value = '';
    export let id = '';
    export let uid = '';
    export let autocomplete = 'off';
    export let disabled = false;
    export let expandable = false;
    export let placeholder = '';
    export let width = '100%';
    export let height = 20;
    export let textDirection = 'ltr';
    export let error = false;
    export let rows = 5;

    let scroll = false;

    let textarea;

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

    onMount(() => {
        if (expandable) {
            resize();
        }
    });
</script>

<style>
    .text-container {
        display: flex;
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

<div class="text-container" style="width:{width}" data-uid={uid}>
    {#if expandable}
        <textarea
            bind:this={textarea}
            class="input"
            class:scroll
            class:is-danger={error}
            bind:value
            on:input={resize}
            style="height:{height}px"
            dir={textDirection}
            rows="1"
            {id}
            {disabled}
            {placeholder}
            {autocomplete}
        />
    {:else}
        <input
            type="text"
            class="input"
            class:is-danger={error}
            bind:value
            {id}
            {disabled}
            {placeholder}
            {autocomplete}
            dir={textDirection}
        />
    {/if}
</div>
