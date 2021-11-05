<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Folder from './Folder.svelte';
    import CollapseGroup from './CollapseGroup.svelte';
    import { beforeUpdate, onMount, getContext } from 'svelte';
    import { currentFolder } from './stores';
    import { parseFolderTree } from './shared';
    import VisualizationGrid from './VisualizationGrid.svelte';
    import httpReq from '@datawrapper/shared/httpReq';

    const user = getContext('user');
    const request = getContext('request');

    export let __;

    export let charts;
    export let folderGroups;

    $: userFolder = parseFolderTree(folderGroups[0]);
    $: teamFolders = folderGroups.slice(1).map(parseFolderTree);

    export let offset = 0;
    export let limit;

    $: total = charts.total;
    $: folderId = $currentFolder ? $currentFolder.id : null;
    $: teamId = $currentFolder ? $currentFolder.teamId : null;
    $: curPath = $currentFolder ? $currentFolder.path : null;

    onMount(() => {
        findFolderByPath($request.path);
    });

    function findFolderByPath(path) {
        for (const g of folderGroups) {
            for (const f of g.folders) {
                if (f.path === path) {
                    $currentFolder = f;
                    return;
                }
            }
        }
    }

    let _offset = offset;
    let _curPath;

    $: sortedTeamFolders = teamFolders.sort((a, b) => {
        if ($user.activeTeam) {
            if (a.teamId === $user.activeTeam.id) return -1;
            if (b.teamId === $user.activeTeam.id) return 1;
        }
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });

    beforeUpdate(async () => {
        if (_offset !== offset || _curPath !== curPath) {
            _offset = offset;
            _curPath = curPath;

            window.history.replaceState({ folderId, teamId }, '', curPath);

            charts = await httpReq.get(
                `/v3/charts?minLastEditStep=2&offset=${offset}&limit=${limit}&folderId=${
                    folderId ? folderId : 'null'
                }${teamId ? `&teamId=${teamId}` : ''}`
            );
        }
    });
</script>

<style>
    .section {
        padding: 2rem 3rem;
    }
</style>

<MainLayout title="{$currentFolder.name || ''} - Archive">
    <section class="section header">
        <div class="container">
            <h1 class="title">Visualization Archive</h1>
        </div>
    </section>
    <section class="section body">
        <div class="container">
            <div class="columns">
                <div class="column is-one-quarter" style="position: relative;">
                    <CollapseGroup title="shared">
                        {#each sortedTeamFolders as teamFolder, i}
                            {#if i}<hr class="my-3" />{/if}
                            <Folder folder={teamFolder} />
                        {/each}
                    </CollapseGroup>

                    <CollapseGroup title="private">
                        <Folder folder={userFolder} />
                    </CollapseGroup>
                </div>
                <div class="column">
                    <VisualizationGrid {__} bind:offset {limit} {total} charts={charts.list} />
                </div>
            </div>
        </div>
    </section>
</MainLayout>
