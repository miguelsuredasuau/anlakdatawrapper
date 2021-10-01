<script>
    import { onMount } from 'svelte';

    export let autocomplete = 'off';
    export let disabled = false;
    export let expandable = false;
    export let height = 20;
    export let id = '';
    export let placeholder = '';
    export let rows = 5;
    export let value = '';
    export let width = '100%';
    export let uid;

    let scroll;
    let textarea;

    function getScrollHeight(element) {
        const actualHeight = element.style.height; // Store original height of element
        element.style.height = 'auto'; // Set height to 'auto' in order to get actual scroll height
        const scrollHeight = element.scrollHeight - 8; // Deduct 8px to account for padding & borders
        element.style.height = actualHeight; // Reset to original height
        return scrollHeight;
    }

    function resize() {
        const { lineHeight } = window.getComputedStyle(textarea);
        const maxHeight = parseInt(lineHeight) * rows;
        const newHeight = getScrollHeight(textarea);
        height = maxHeight < newHeight ? maxHeight : newHeight;
        scroll = maxHeight < newHeight;
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

<div class="text-container" style="width: {width}" data-uid={uid}>
    {#if expandable}
        <textarea
            bind:this={textarea}
            class:scroll
            bind:value
            on:input={resize}
            style="height: {height}px"
            rows="1"
            {id}
            {disabled}
            {placeholder}
            {autocomplete}
        />
    {:else}
        <input type="text" bind:value {id} {disabled} {placeholder} {autocomplete} />
    {/if}
</div>
