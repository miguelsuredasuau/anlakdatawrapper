<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import Dropdown from '_partials/Dropdown.svelte';

    import httpReq from '@datawrapper/shared/httpReq.js';
    import { getContext } from 'svelte';
    import { currentFolder } from './stores';

    export let __;
    export let folderId;
    export let teamId;

    const { addFolder } = getContext('page/archive');

    async function addSubfolder() {
        isActive = false;

        const name = prompt(__('archive / add-in-folder / name'), '');
        if (name === null || name.trim() === '') return;

        const payload = { name };

        if (folderId) {
            payload.parentId = folderId;
        } else if (teamId) {
            payload.organizationId = teamId;
        }

        try {
            const res = await httpReq.post('/v3/folders', { payload });
            addFolder({
                teamId,
                ...res,
                key: res.id,
                chartCount: 0
            });
        } catch (error) {
            if (error.status === 409) {
                window.alert(__('archive / folder / duplicate-name'));
            }
        }
    }

    let isActive = false;
    $: createQuery = folderId
        ? `?folder=${folderId}`
        : teamId
        ? `?team=${teamId}`
        : `?team=${null}`;
</script>

<style lang="scss">
    @import '../../styles/colors.scss';

    .add-folder {
        .rotated-icon {
            transform: rotate(180deg);
        }
        .button :global(.icon) {
            color: white;
        }
    }
</style>

<div class="add-folder block">
    <Dropdown bind:active={isActive} disabled={$currentFolder.search || $currentFolder.virtual}>
        <button
            disabled={$currentFolder.search || $currentFolder.virtual}
            class="button is-primary"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            slot="trigger"
        >
            <IconDisplay icon="add" className="mr-2" />
            <span>
                {__('archive / add-in-folder / new')}
            </span>
            <IconDisplay
                icon="expand-down-bold"
                size="0.8em"
                className:rotated-icon={isActive}
                className="ml-2"
            />
        </button>
        <div class="dropdown-content" slot="content">
            <a class="dropdown-item" href="#/" on:click|preventDefault={addSubfolder}>
                <IconDisplay icon="folder" />
                <span>{__('archive / add-in-folder / folder')}</span>
            </a>

            <hr class="dropdown-divider" />

            {#each ['chart', 'map', 'table'] as type}
                <a class="dropdown-item" href="/create/{type}{createQuery}">
                    <IconDisplay icon="dw-{type}" />
                    <span>{__(`archive / add-in-folder / ${type}`)}</span>
                </a>
            {/each}
        </div>
    </Dropdown>
</div>
