<script>
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import { onMount, getContext, beforeUpdate } from 'svelte';
    import { currentFolder } from './stores';
    import { byName } from './shared';

    const user = getContext('user');

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

    const indentation = 20; // @todo: find best value
</script>

<style lang="scss">
    @import '../../styles/colors.scss';

    .folder {
        position: relative;
        color: $dw-black-bis;
        > .self > a > :global(.icon) {
            font-size: 20px;
            color: $dw-scooter;
        }
        > .self > a > span :global(.icon) {
            font-size: 17px;
        }

        .self {
            position: relative;
            a {
                color: $dw-black-bis;
            }

            &.active {
                font-weight: bold;
                background: $dw-scooter-lightest;
            }
        }
    }
    .collapse-toggle {
        display: block;
        position: absolute;
        padding: 5px;
        left: -25px;
        top: 0px;
        cursor: pointer;

        &:before {
            transition: transform 0.3s ease-in-out;
            display: block;
            content: '\e03d';
            color: $dw-grey-darker;
            font: normal normal normal 10px/1 'iconmonstr-iconic-font';
        }
        .open > .self &:before {
            transform: rotate(90deg);
        }
    }
</style>

<div class="folder my-2" class:open>
    <div
        class="self"
        class:active={isCurrent}
        style="padding-left: {20 + folder.level * indentation}px"
    >
        {#if hasChildren}
            <div
                style="left: {folder.level * indentation}px"
                class="collapse-toggle"
                on:click={() => (open = !open)}
            />
        {/if}
        <a
            href={folder.path}
            on:click|preventDefault={() => {
                $currentFolder = folder;
            }}
            ><SvgIcon
                icon="folder{isSharedFolder ? '-shared' : ''}"
                className="mr-1"
                valign="middle"
            />
            <span>
                {folder.name}
                {#if folder.chartCount}<span class="has-text-grey">({folder.chartCount})</span>{/if}
                {#if !folder.id && (folder.teamId && $user.activeTeam ? $user.activeTeam.id === folder.teamId : !$user.activeTeam)}
                    <SvgIcon icon="check-circle" className="ml-1" valign="sub" />
                {/if}
            </span>
        </a>
    </div>
    {#if open && hasChildren}
        <div class="children">
            {#each folder.children.sort(byName) as child (child.id)}
                <svelte:self folder={child} />
            {/each}
        </div>
    {/if}
</div>
