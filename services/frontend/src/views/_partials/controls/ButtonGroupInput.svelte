<script>
    import IconDisplay from '../displays/IconDisplay.svelte';

    export let options = [];
    export let value;
</script>

<div class="buttons has-addons">
    {#each options as option}
        <button
            class="button"
            class:is-selected={value === option.key}
            class:is-primary={value === option.key}
            on:click={() => (value = option.key)}
        >
            {#if option.icon}
                <IconDisplay size="20px" icon={option.icon} />
            {/if}
            {#if option.label}
                <span>{option.label}</span>
            {/if}
        </button>
    {/each}
</div>
