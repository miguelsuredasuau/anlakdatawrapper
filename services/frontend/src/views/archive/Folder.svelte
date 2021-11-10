<script>
    import Dropdown from '_partials/components/Dropdown.svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import { onMount, getContext, beforeUpdate, tick } from 'svelte';
    import { currentFolder } from './stores';
    import { byName } from './shared';

    const user = getContext('user');
    const { deleteFolder, patchFolder } = getContext('page/archive');

    onMount(() => {
        const val = window.localStorage.getItem(storageKey(folder));
        if (val !== undefined) {
            open = _open = val === 'expanded';
        }
        currentFolder.subscribe(newFolder => {
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

    let open = folder.level < 3;
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

    /*
     * turns on the folder name edit mode
     * selects folder name and focusses input
     */
    async function renameFolder() {
        editMode = true;
        await tick();
        folderMenuActive = false;
        if (window.getSelection && document.createRange) {
            const range = document.createRange();
            range.selectNodeContents(folderNameSpan);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (document.body.createTextRange) {
            const range = document.body.createTextRange();
            range.moveToElementText(folderNameSpan);
            range.select();
        }
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

    function handleDragStart(event) {
        event.dataTransfer.setData('folder', JSON.stringify(folder));
    }

    async function handleDrop(event) {
        const folderData = event.dataTransfer.getData('folder');
        if (folderData) {
            return await handleFolderDrop(JSON.parse(folderData));
        }
    }

    async function handleFolderDrop(droppedFolder) {
        if (!droppedFolder) {
            return;
        }
        try {
            await patchFolder(droppedFolder, {
                parentId: folder.id,
                teamId: folder.teamId || null
            });
        } catch (err) {
            window.alert(err.message);
            // window.alert(__('archive / folder / duplicate-name'));
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
        > .self > a > span :global(.icon) {
            font-size: 17px;
            color: $dw-grey;
        }

        .self {
            position: relative;
            border-radius: var(--radius-small);
            a {
                color: $dw-black-bis;
            }

            &:hover {
                background: $dw-white-ter;
                a {
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
                font-weight: normal;

                color: transparent;
                cursor: pointer;
                font-size: 16px;

                .dropdown-item :global(.icon) {
                    color: $dw-scooter;
                    font-size: 20px;
                }
            }

            &:hover .folder-menu {
                color: $dw-grey;
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
</style>

<div
    class="folder"
    class:open
    class:is-search={!!folder.search}
    class:is-shared={!!folder.teamId}
    draggable="true"
    on:dragstart|stopPropagation={handleDragStart}
    on:dragover|preventDefault
    on:drop|stopPropagation={handleDrop}
>
    <div
        class="self py-1"
        class:active={isCurrent}
        style="padding-left: {22 + folder.level * indentation}px"
    >
        {#if hasChildren}
            <button
                style="left: {folder.level * indentation}px"
                class="button is-ghost p-1 collapse-toggle"
                on:click={() => (open = !open)}
            >
                <SvgIcon icon="disclosure" valign="baseline" className="m-0" />
            </button>
        {/if}
        <a
            href={folder.path}
            on:click|preventDefault={() => {
                $currentFolder = folder;
            }}
            draggable="false"
            ><SvgIcon
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
            <span>
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
                    <SvgIcon icon="check-circle" className="ml-1" valign="sub" />
                {/if}
            </span>
        </a>
        {#if folder.id}
            <div class="folder-menu">
                <Dropdown bind:active={folderMenuActive}>
                    <div slot="trigger">
                        <SvgIcon icon="menu-vertical" valign="middle" />
                    </div>
                    <div slot="content" class="dropdown-content">
                        <a
                            href="#/rename"
                            on:click|preventDefault={renameFolder}
                            class="dropdown-item"
                            ><SvgIcon valign="text-bottom" icon="rename" />
                            <span>{__('archive / folder / rename')}</span></a
                        >
                        <a
                            href="#/delete"
                            on:click|preventDefault={() => deleteFolder(folder)}
                            class="dropdown-item"
                            ><SvgIcon valign="text-bottom" icon="trash" />
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
