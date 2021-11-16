<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { currentFolder, subfolderGridDropZone } from './stores';
    import { getContext } from 'svelte';

    const { handleDragStart, handleDrop, handleDragEnter, handleDragLeave } = getContext(
        'page/archive/drag-and-drop'
    );

    $: isDropZone = $subfolderGridDropZone === folder.key;

    export let folder;
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    @import 'bulma/sass/utilities/_all.sass';
    .box {
        border: 1px solid $dw-grey-lighter;
        padding: 10px 15px;
        box-shadow: none;
        &:hover {
            border-color: $dw-grey;
        }
        :global(.icon) {
            color: $dw-scooter;
            font-size: 30px;
        }
    }

    .is-drop-zone .box {
        border: 1px dashed $dw-grey-dark;
        position: relative;
        &:before {
            content: '';
            display: block;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            border-radius: var(--radius);
            border: 10px solid $dw-scooter-lightest;
            background: transparent;
        }
    }

    @include fullhd {
        .box {
            padding: 20px;
        }
    }
</style>

<a
    href={folder.path}
    class:is-drop-zone={isDropZone}
    draggable="true"
    on:click|preventDefault={() => ($currentFolder = folder)}
    on:dragstart|stopPropagation={() => handleDragStart('folder', folder)}
    on:dragenter|stopPropagation={ev => {
        $subfolderGridDropZone = folder.key;
        handleDragEnter(ev, folder);
    }}
    on:dragleave|stopPropagation={ev => {
        if ($subfolderGridDropZone === folder.key) {
            $subfolderGridDropZone = undefined;
        }
        handleDragLeave(ev);
    }}
    on:dragover|preventDefault={() => {
        $subfolderGridDropZone = folder.key;
    }}
    on:drop|preventDefault|stopPropagation={() => handleDrop(folder)}
>
    <div class="box has-border is-size-5">
        <IconDisplay icon="folder" className="mr-1" valign="middle" />
        <span class="has-text-weight-medium">{folder.name}</span>
        {#if folder.chartCount}<span class="has-text-grey">({folder.chartCount})</span>{/if}
    </div>
</a>
