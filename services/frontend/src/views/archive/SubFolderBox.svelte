<script>
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import { currentFolder, subfolderGridDropZone } from './stores';
    import { getContext } from 'svelte';

    const { handleDragStart, handleDrop, handleDragEnter, handleDragLeave } = getContext(
        'page/archive/drag-and-drop'
    );

    export let folder;
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    .box {
        border: 1px solid $dw-grey-lighter;
        padding: 20px 25px;
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
</style>

<a
    href={folder.path}
    on:click|preventDefault={() => ($currentFolder = folder)}
    class:is-drop-zone={$subfolderGridDropZone === folder.key}
>
    <div
        class="box has-border is-size-5"
        draggable="true"
        on:dragstart|stopPropagation={ev => handleDragStart(ev, 'folder', folder)}
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
        on:drop|stopPropagation={ev => handleDrop(ev, folder)}
    >
        <SvgIcon icon="folder" className="mr-1" valign="middle" />
        <span class="has-text-weight-medium">{folder.name}</span>
        {#if folder.chartCount}<span class="has-text-grey">({folder.chartCount})</span>{/if}
    </div>
</a>
