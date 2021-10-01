<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let className;
    export { className as class };
    export let disabled = false;
    export let optgroups = [];
    export let options = [];
    export let value = null;
    export let width = 'auto';
    export let uid;
</script>

<!-- svelte-ignore a11y-no-onchange -->
<select
    bind:value
    class:select-css={true}
    class={className}
    style="width: {width}"
    on:change={evt => dispatch('change', evt)}
    {disabled}
    data-uid={uid}
>
    {#if options.length}
        {#each options as opt}
            <option value={opt.value} selected={opt.value === value}>{opt.label}</option>
        {/each}
    {/if}
    {#if optgroups.length}
        {#each optgroups as optgroup}
            <optgroup label={optgroup.label}>
                {#each optgroup.options as opt}
                    <option value={opt.value} selected={opt.value === value}>{opt.label}</option>
                {/each}
            </optgroup>
        {/each}
    {/if}
</select>
