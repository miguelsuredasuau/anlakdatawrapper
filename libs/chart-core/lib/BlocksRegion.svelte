<script>
    import Block from './Block.svelte';

    export let id;
    export let name;
    export let blocks;
</script>

{#if blocks.length}
    <div {id} class={name}>
        {#each blocks as block}
            {#if block.tag === 'h3'}
                <h3 class="block {block.id}-block">
                    <Block {block} />
                </h3>
            {:else if block.tag === 'p'}
                <p class="block {block.id}-block">
                    <Block {block} />
                </p>
            {:else}
                <div
                    class="block {block.id}-block"
                    style={block.id.includes('svg-rule') ? 'font-size:0px;' : ''}
                >
                    <Block {block} />
                </div>
            {/if}
        {/each}
    </div>
{/if}
