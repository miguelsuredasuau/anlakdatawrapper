<script>
    import Block from './Block.svelte';
    import { themeData } from './stores';

    export let id;
    export let name;
    export let blocks = [];
    export let styles = null;
    export let emotion;

    if (!emotion) throw new Error('need to pass emotion for block region ' + name);
</script>

{#if blocks.length}
    <div {id} class="{name} {emotion && styles ? styles(emotion, $themeData) : ''}">
        {#each blocks as block}
            {#if block.tag === 'h3'}
                <h3
                    class="block {block.id}-block {emotion && block.styles
                        ? block.styles(emotion, $themeData)
                        : ''}"
                >
                    <Block {block} />
                </h3>
            {:else if block.tag === 'p'}
                <p
                    class="block {block.id}-block {emotion && block.styles
                        ? block.styles(emotion, $themeData)
                        : ''}"
                >
                    <Block {block} />
                </p>
            {:else}
                <div
                    class="block {block.id}-block {emotion && block.styles
                        ? block.styles(emotion, $themeData)
                        : ''}"
                    style={block.id.includes('svg-rule') ? 'font-size:0px;' : ''}
                >
                    <Block {block} />
                </div>
            {/if}
        {/each}
    </div>
{/if}
