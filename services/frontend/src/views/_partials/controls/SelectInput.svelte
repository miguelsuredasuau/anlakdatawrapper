<script>
    import { createEventDispatcher } from 'svelte';
    export let options; // [{ value, label }, ...] or [value, value, ...]
    export let value;

    const dispatch = createEventDispatcher();

    $: options_ =
        typeof options[0] === 'string' ? options.map(s => ({ value: s, label: s })) : options;
</script>

<div class="select">
    <select bind:value on:change={() => dispatch('select', value)}>
        {#each options_ as option}<option value={option.value}>{option.label}</option>{/each}
    </select>
</div>
