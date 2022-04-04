<script>
    import IconDisplay from './IconDisplay.svelte';
    export let path = [];
    export let className = null;
</script>

<nav class="breadcrumb {className || ''}" aria-label="breadcrumbs">
    <ul>
        {#each path as part, i}
            <li>
                {#if part.url}
                    <a href={part.url} class={className}
                        >{#if part.svgIcon}
                            <IconDisplay size="1.3em" icon={part.svgIcon} />
                        {/if}<span>{@html part.title}</span></a
                    >
                {:else}
                    <span class="px-2 {className}"
                        >{#if part.svgIcon}
                            <IconDisplay size="1.3em" icon={part.svgIcon} />
                        {/if}<span>{@html part.title}</span></span
                    >
                {/if}
            </li>
        {/each}
    </ul>
</nav>
