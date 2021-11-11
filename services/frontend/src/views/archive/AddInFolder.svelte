<script>
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import Dropdown from '_partials/components/Dropdown.svelte';

    import httpReq from '@datawrapper/shared/httpReq';
    import { getContext } from 'svelte';

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
                key: res.id
            });
        } catch (error) {
            if (error.status === 409) {
                window.alert(__('archive / folder / duplicate-name'));
            }
        }
    }

    let isActive = false;
    $: createQuery = folderId ? `?folder=${folderId}` : teamId ? `?team=${teamId}` : '';
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
    <Dropdown bind:active={isActive}>
        <button
            class="button is-primary"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            slot="trigger"
        >
            <SvgIcon icon="add" size="20px" className="mr-2 ml-0" />
            <span>
                {__('archive / add-in-folder / new')}
            </span>
            <SvgIcon
                icon="expand-down-bold"
                size="0.8em"
                className:rotated-icon={isActive}
                className="ml-2 mr-0"
            />
        </button>
        <div class="dropdown-content" slot="content">
            <a class="dropdown-item" href="#/" on:click|preventDefault={addSubfolder}>
                <SvgIcon icon="folder" />
                <span>{__('archive / add-in-folder / folder')}</span>
            </a>

            <hr class="dropdown-divider" />

            {#each ['chart', 'map', 'table'] as type}
                <a class="dropdown-item" href="/{type}/create{createQuery}">
                    <SvgIcon icon="dw-{type}" />
                    <span>{__(`archive / add-in-folder / ${type}`)}</span>
                </a>
            {/each}
        </div>
    </Dropdown>
</div>
