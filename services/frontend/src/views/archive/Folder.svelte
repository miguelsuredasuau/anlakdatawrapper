<script>
    import Dropdown from '_partials/Dropdown.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { onMount, getContext, beforeUpdate, tick } from 'svelte';
    import { currentFolder, folderTreeDropZone } from './stores';
    import { byName, selectAll } from './shared';

    const user = getContext('user');
    const { deleteFolder, patchFolder, foreignTeam } = getContext('page/archive');
    const { handleDragStart, handleDrop, handleDragEnter, handleDragLeave } = getContext(
        'page/archive/drag-and-drop'
    );

    onMount(() => {
        const val = window.localStorage.getItem(storageKey(folder));
        if (val !== undefined) {
            open = _open = val === 'expanded';
        } else {
            open = _open = folder.level < 3;
        }

        currentFolder.subscribe((newFolder = {}) => {
            // check if the user navigates into a sub-folder of the
            // current one, and if so, let's expand this folder
            if (!open && folder.children && folder.children.find(f => f.id === newFolder.id)) {
                open = true;
            }
        });
    });

    beforeUpdate(() => {
        if (open !== _open) {
            window.localStorage.setItem(storageKey(folder), open ? 'expanded' : 'collapsed');
            _open = open;
        }
    });

    export let folder;
    export let __;

    let open = false;
    let _open = open;

    $: isCurrent = $currentFolder.path === folder.path;
    $: hasChildren = folder.children && folder.children.length;
    $: isSharedFolder = !!folder.teamId;

    function storageKey(folder) {
        return folder.id
            ? `chart-folder-${folder.id}`
            : folder.teamId
            ? `chart-folder-org-root-${folder.teamId}`
            : 'chart-folder-user-root';
    }

    let editMode = false;
    let folderNameSpan;
    let folderMenuActive;
    $: isDropZone = $folderTreeDropZone === folder.key;

    /*
     * turns on the folder name edit mode
     * selects folder name and focusses input
     */
    async function renameFolder() {
        editMode = true;
        await tick();
        folderMenuActive = false;
        selectAll(folderNameSpan);
        await tick();
        folderNameSpan.focus();
    }

    /*
     * runs when user is done editing the folder name
     * updates folder name via API
     */
    async function folderNameBlur() {
        const newName = folderNameSpan.innerText.trim();
        editMode = false;
        if (newName !== folder.name) {
            try {
                await patchFolder(folder, {
                    name: newName
                });
            } catch (err) {
                if (err.status === 409) {
                    window.alert(__('archive / folder / duplicate-name'));
                }
            }
        }
    }

    /*
     * monitor key strokes while user edits a folder name
     * Return = save, Esc = reset
     */
    function folderNameKeyUp(event) {
        if (event.key === 'Enter') {
            // enter pressed
            event.preventDefault();
            event.stopPropagation();
            folderNameSpan.blur();
        } else if (event.key === 'Esc' || event.key === 'Escape') {
            // Esc pressed, reset old folder name
            folderNameSpan.innerText = folder.name;
            folderNameSpan.blur();
        }
    }

    const indentation = 16;
</script>

<style lang="scss">
    @import '../../styles/colors.scss';

    .folder {
        position: relative;
        > .self > a > :global(.icon) {
            font-size: 20px;
            color: $dw-scooter;
        }

        > .self.is-foreign > a > :global(.icon) {
            color: $dw-red;
        }

        > .self > a > span :global(.icon) {
            font-size: 17px;
            color: $dw-grey;
        }

        .self {
            border: 1px solid transparent;
            position: relative;
            border-radius: var(--radius-small);
            & > a {
                color: $dw-black-bis;
            }

            &:hover {
                background: $dw-white-ter;
                & > a {
                    color: $dw-black;
                }
            }
            &.active {
                font-weight: bold;
                background: $dw-scooter-lightest;

                &:hover {
                    background: darken($dw-scooter-lightest, 02%);
                }
            }

            .folder-menu {
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                font-weight: normal;

                color: transparent;
                cursor: pointer;
                font-size: 16px;
            }

            &:hover .folder-menu {
                color: $dw-grey;
            }

            .name {
                line-height: 1.3;
                overflow-wrap: break-word;
                hyphens: auto;
            }
        }
        &.is-search {
            .self {
                opacity: 0.75;
            }
        }
    }
    .collapse-toggle {
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        cursor: pointer;
        height: auto;
        line-height: 1;
        color: $dw-grey-dark;

        &:focus:not(:focus-visible) {
            box-shadow: none;
        }

        &:hover {
            color: $dw-black-bis;
        }
        :global(.icon) {
            transform-origin: center;
            font-size: 12px;
            transition: transform 0.2s;
            transition-timing-function: ease-out;
            position: relative;
            top: 1px;
        }
    }
    .open > .self .collapse-toggle :global(.icon) {
        transform: rotate(90deg);
    }

    .is-drop-zone > .self {
        border: 1px dashed $dw-grey-dark;
        background: $dw-scooter-lightest;
    }
</style>

<div
    class="folder"
    class:open
    class:is-search={!!folder.search}
    class:is-shared={!!folder.teamId}
    class:is-drop-zone={isDropZone}
>
    <div
        class="self py-1 pr-1"
        class:active={isCurrent}
        class:is-foreign={foreignTeam && foreignTeam === folder.teamId}
        style="padding-left: {22 + folder.level * indentation}px"
        draggable={!folder.search && !!folder.id}
        on:dragstart|stopPropagation={() => {
            if (folder.search) return;
            handleDragStart('folder', folder);
        }}
        on:dragenter|stopPropagation={ev => {
            if (folder.search) return;
            $folderTreeDropZone = folder.key;
            handleDragEnter(ev, folder);
        }}
        on:dragleave|stopPropagation={ev => {
            if ($folderTreeDropZone === folder.key) {
                $folderTreeDropZone = undefined;
            }
            handleDragLeave(ev);
        }}
        on:dragover|preventDefault={() => {
            if (folder.search) return;
            $folderTreeDropZone = folder.key;
        }}
        on:drop|preventDefault|stopPropagation={() => {
            if (folder.search) return;
            handleDrop(folder);
        }}
    >
        {#if hasChildren}
            <button
                style="left: {folder.level * indentation}px"
                class="button is-ghost p-1 collapse-toggle"
                on:click={() => (open = !open)}
            >
                <IconDisplay icon="disclosure" valign="baseline" className="m-0" />
            </button>
        {/if}
        <a
            href={folder.path}
            on:click|preventDefault={() => {
                $currentFolder = folder;
            }}
            draggable="false"
            class="is-flex is-align-items-start"
            ><IconDisplay
                icon="folder{folder.search
                    ? '-search-outline'
                    : folder.id
                    ? ''
                    : isSharedFolder
                    ? '-shared'
                    : '-user'}"
                className="mr-1"
                valign="middle"
            />
            <span class="name">
                {#if editMode}
                    <span
                        bind:this={folderNameSpan}
                        contenteditable={editMode}
                        on:blur={folderNameBlur}
                        on:keyup|stopPropagation={folderNameKeyUp}>{folder.name}</span
                    >
                {:else}
                    {folder.name}
                {/if}
                {#if folder.chartCount}<span class="has-text-grey">({folder.chartCount})</span>{/if}
                {#if !folder.id && !folder.search && (!$user.activeTeam ? !folder.teamId : $user.activeTeam.id === folder.teamId)}
                    <IconDisplay icon="check-circle" className="ml-1" valign="sub" />
                {/if}
            </span>
        </a>
        {#if folder.id}
            <div class="folder-menu">
                <Dropdown bind:active={folderMenuActive}>
                    <div slot="trigger">
                        <IconDisplay icon="menu-vertical" valign="middle" />
                    </div>
                    <div slot="content" class="dropdown-content">
                        <a
                            href="#/rename"
                            on:click|preventDefault={renameFolder}
                            class="dropdown-item"
                            ><IconDisplay valign="text-bottom" icon="rename" />
                            <span>{__('archive / folder / rename')}</span></a
                        >
                        <a
                            href="#/delete"
                            on:click|preventDefault={() => deleteFolder(folder)}
                            class="dropdown-item"
                            ><IconDisplay valign="text-bottom" icon="trash" />
                            <span>{__('archive / folder / delete')}</span></a
                        >
                    </div>
                </Dropdown>
            </div>
        {/if}
    </div>
    {#if open && hasChildren}
        <div class="children">
            {#each folder.children.sort(byName) as child (child.id)}
                <svelte:self {__} folder={child} />
            {/each}
        </div>
    {/if}
</div>
