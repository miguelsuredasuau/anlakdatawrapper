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
{:else}
    <p class="subtitle is-size-4 has-text-grey">This folder doesn't have any sub folders.</p>
{/if}

<hr class="my-3" />
