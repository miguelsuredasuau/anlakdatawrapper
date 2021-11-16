<script>
    import { currentFolder } from './stores';

    let parentFolders = [];
    $: {
        let cur = $currentFolder;
        const newParentFolders = [];
        while (cur.getParent) {
            cur = cur.getParent();
            newParentFolders.unshift(cur);
        }
        parentFolders = newParentFolders;
    }
</script>

<h1 class="title is-size-3">
    {#each parentFolders as p}
        <a
            href={p.path}
            on:click|preventDefault={() => ($currentFolder = p)}
            class="has-text-weight-light">{p.name}</a
        ><span class="has-text-grey px-3">›</span>
    {/each}
    {#if $currentFolder.name}
        <span class="has-text-weight-medium">{$currentFolder.name}</span>
    {/if}
</h1>
