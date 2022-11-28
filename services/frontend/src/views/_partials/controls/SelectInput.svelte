<script>
    import { createEventDispatcher } from 'svelte';
    export let options; // [{ value, label }, ...] or [value, value, ...]
    export let value;
    export let uid = null;
    export let disabled = false;

    const dispatch = createEventDispatcher();

    export let placeholder = null;

    $: options_ =
        typeof options[0] === 'string' ? options.map(s => ({ value: s, label: s })) : options;

    let className = '';
    export { className as class };
</script>

<div class="select {className}">
    <select data-uid={uid} {disabled} bind:value on:change={() => dispatch('select', value)}>
        {#if placeholder}
            <option disabled value={null}>{placeholder}</option>
        {/if}
        {#each options_ as option}<option value={option.value}>{option.label}</option>{/each}
    </select>
</div>
