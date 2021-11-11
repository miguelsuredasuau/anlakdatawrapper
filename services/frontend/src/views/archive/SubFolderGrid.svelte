<script>
    import { byName } from './shared';
    import { currentFolder } from './stores';
    import SubFolderBox from './SubFolderBox.svelte';

    export let __;
</script>

{#if $currentFolder.children && $currentFolder.children.length}
    <div class="columns is-multiline is-mobile">
        {#each $currentFolder.children.sort(byName) as folder}
            <div class="column is-one-third-desktop is-half-tablet is-half-mobile">
                <SubFolderBox {folder} />
            </div>
        {/each}
    </div>
    <hr class="my-3" />
{/if}
