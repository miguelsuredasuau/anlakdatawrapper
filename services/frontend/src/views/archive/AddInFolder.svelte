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
                ...res
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

    .type-icon {
        margin-right: 0.5ex;
        color: $dw-scooter;
        font-size: 20px;
        width: 1em;
        height: 1em;
        vertical-align: middle;
    }

    .rotated-icon {
        transform: rotate(180deg);
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
            <span class="icon" aria-hidden="true">
                <SvgIcon icon="add" />
            </span>
            <span>
                {__('archive / add-in-folder / new')}
            </span>
            <span class="icon ml-2" class:rotated-icon={isActive} aria-hidden="true">
                <SvgIcon icon="expand-down-bold" size="0.8em" />
            </span>
        </button>
        <div class="dropdown-content" slot="content">
            <a class="dropdown-item" href="#/" on:click|preventDefault={addSubfolder}>
                <span class="icon type-icon" aria-hidden="true">
                    <SvgIcon icon="folder" />
                </span>
                <span>{__('archive / add-in-folder / folder')}</span>
            </a>

            <hr class="dropdown-divider" />

            {#each ['chart', 'map', 'table'] as type}
                <a class="dropdown-item" href="/{type}/create{createQuery}">
                    <span class="icon type-icon" aria-hidden="true">
                        <SvgIcon icon="dw-{type}" />
                    </span>
                    <span>{__(`archive / add-in-folder / ${type}`)}</span>
                </a>
            {/each}
        </div>
    </Dropdown>
</div>
