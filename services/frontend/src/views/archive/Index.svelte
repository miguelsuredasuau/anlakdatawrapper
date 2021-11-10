<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Folder from './Folder.svelte';
    import CollapseGroup from './CollapseGroup.svelte';
    import FolderBreadcrumbNav from './FolderBreadcrumbNav.svelte';
    import { beforeUpdate, onMount, getContext, setContext } from 'svelte';
    import { currentFolder } from './stores';
    import { parseFolderTree } from './shared';
    import VisualizationGrid from './VisualizationGrid.svelte';
    import SubFolderGrid from './SubFolderGrid.svelte';
    import SearchInput from './SearchInput.svelte';
    import AddInFolder from './AddInFolder.svelte';
    import VisualizationModal from './VisualizationModal.svelte';
    import httpReq from '@datawrapper/shared/httpReq';

    const user = getContext('user');
    const request = getContext('request');

    export let __;

    export let apiQuery;
    export let charts;
    export let folderGroups;
    export let themeBgColors;

    setContext('page/archive', {
        findFolderByPath,
        addFolder,
        openVisualization,
        loadCharts,
        themeBgColors
    });

    $: userFolder = parseFolderTree(folderGroups[0]);
    $: teamFolders = folderGroups.slice(1).map(parseFolderTree);

    export let offset = 0;
    export let limit;

    let currentChart;
    let currentChartOpen = false;

    $: total = charts.total;
    $: folderId = $currentFolder ? $currentFolder.id : null;
    $: teamId = $currentFolder ? $currentFolder.teamId : null;
    $: curPath = $currentFolder ? $currentFolder.path : null;
    $: curSearch = $currentFolder ? $currentFolder.search || '' : '';

    const modalHashRegex = /^#\/([a-z0-9]{5})$/i;

    let _mounted = false;
    onMount(() => {
        if (modalHashRegex.test(window.location.hash)) {
            const m = window.location.hash.match(modalHashRegex);
            openVisualization(m[1]);
        }
        findFolderByPath($request.path, $request.query);
        _mounted = true;
    });

    function findFolderByPath(path, query) {
        if (query.search) return;
        for (const g of folderGroups) {
            for (const f of g.folders) {
                if (f.path === path) {
                    $currentFolder = f;
                    return;
                }
            }
        }
    }

    function addFolder(folder) {
        const folderGroup = folder.teamId
            ? folderGroups.find(d => d.teamId === folder.teamId)
            : folderGroups[0];
        if (folderGroup) {
            folderGroup.folders.push(folder);
            folderGroups = folderGroups;
            findFolderByPath($request.path, {});
        }
    }

    async function openVisualization(chart) {
        currentChart = await httpReq.get(
            `/v3/charts/${typeof chart === 'string' ? chart : chart.id}`
        );
        currentChartOpen = true;
    }

    async function loadCharts(force = false) {
        const query = `/charts?minLastEditStep=2&offset=${offset}&limit=${limit}&${
            curSearch
                ? `search=${encodeURIComponent(curSearch)}`
                : `folderId=${folderId ? folderId : 'null'}${teamId ? `&teamId=${teamId}` : ''}`
        }`;
        if (query !== apiQuery || force) {
            apiQuery = query;
            charts = await httpReq.get(`/v3${query}`);
        }
    }

    let _offset = offset;
    let _prevFolder;

    $: sortedTeamFolders = teamFolders.sort((a, b) => {
        if ($user.activeTeam) {
            if (a.teamId === $user.activeTeam.id) return -1;
            if (b.teamId === $user.activeTeam.id) return 1;
        }
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });

    beforeUpdate(async () => {
        // prevent this from running before the page has mounted
        // to avoid loading charts for the 'default' folder
        if (!_mounted) return;
        if (_offset !== offset || _prevFolder !== $currentFolder) {
            _offset = offset;
            _prevFolder = $currentFolder;

            window.history.replaceState({ folderId, teamId }, '', curPath);
            loadCharts();
        }
    });
</script>

<style>
    .section {
        padding: 2rem 3rem;
    }
</style>

<MainLayout title="{$currentFolder.name || ''} - Archive">
    <VisualizationModal {__} bind:open={currentChartOpen} bind:chart={currentChart} />
    <section class="section header">
        <div class="container">
            <div class="columns is-vcentered">
                <div class="column">
                    <FolderBreadcrumbNav />
                </div>
                <div class="column is-narrow">
                    <SearchInput {__} />
                </div>
            </div>
        </div>
    </section>
    <div class="container">
        <hr class="my-0" />
    </div>
    <section class="section body">
        <div class="container">
            <div class="columns">
                <div class="column is-one-quarter" style="position: relative;">
                    {#if $currentFolder.search}
                        <CollapseGroup title="search">
                            <Folder folder={$currentFolder} />
                        </CollapseGroup>
                    {/if}
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
                    {#if !$currentFolder.search}
                        <AddInFolder {__} {folderId} {teamId} />
                        <div class="subfolders block">
                            <SubFolderGrid {__} />
                        </div>
                    {/if}
                    <div class="block">
                        {#if total > 0}
                            <VisualizationGrid
                                {__}
                                bind:offset
                                {limit}
                                {total}
                                charts={charts.list}
                            />
                        {:else}
                            <p class="subtitle is-size-4 has-text-grey">
                                {@html __('mycharts / empty-folder').replace(
                                    /%location%/g,
                                    folderId
                                        ? `?folder=${folderId}`
                                        : teamId
                                        ? `?team=${teamId}`
                                        : ''
                                )}
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </section>
</MainLayout>
