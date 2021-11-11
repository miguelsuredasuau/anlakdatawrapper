<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import Folder from './Folder.svelte';
    import CollapseGroup from './CollapseGroup.svelte';
    import FolderBreadcrumbNav from './FolderBreadcrumbNav.svelte';
    import { beforeUpdate, onMount, getContext, setContext } from 'svelte';
    import { parseFolderTree, getFolderUri } from './shared';
    import { currentFolder, selectedCharts, folderTreeDropZone } from './stores';
    import ActionBar from './ActionBar.svelte';
    import VisualizationGrid from './VisualizationGrid.svelte';
    import SubFolderGrid from './SubFolderGrid.svelte';
    import SearchInput from './SearchInput.svelte';
    import VisualizationModal from './VisualizationModal.svelte';
    import DragNotification from './DragNotification.svelte';
    import httpReq from '@datawrapper/shared/httpReq';

    const user = getContext('user');
    const request = getContext('request');

    export let __;

    export let apiQuery;
    export let charts;
    export let teams;
    export let folders;
    export let themeBgColors;

    setContext('page/archive', {
        findFolderByPath,
        addFolder,
        updateFolders: refreshFolders,
        async deleteFolder(folder) {
            if (window.confirm(__('archive / folder / delete / confirm'))) {
                await httpReq.delete(`/v3/folders/${folder.id}`);
                delete folders[folder.key];
                refreshFolders();
                if ($currentFolder.id === folder.id) {
                    // select parent folder
                    $currentFolder = folder.getParent();
                }
            }
        },
        patchFolder,
        deleteChart,
        duplicateChart,
        openChart,
        moveFolder,
        themeBgColors
    });

    $: userFolder = parseFolderTree(folders);
    $: teamFolders = teams.map(t => parseFolderTree(folders, t.id));

    export let offset = 0;
    export let limit;

    let currentChart;
    let currentChartOpen = false;
    let dragNotification;
    let dragTarget;
    let draggedObject;
    let dragDestination;

    setContext('page/archive/drag-and-drop', {
        handleDragStart,
        handleDrop,
        handleDragEnter,
        handleDragLeave
    });

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
            openChart(m[1]);
        }
        findFolderByPath($request.path, $request.query);
        _mounted = true;
    });

    function findFolderByPath(path, query) {
        if (query.search) return;

        for (const f of Object.values(folders)) {
            if (f.path === path) {
                $currentFolder = f;
                return;
            }
        }
    }

    function addFolder(folder) {
        folders[folder.key] = folder;
        refreshFolders();
    }

    async function patchFolder(folder, patchObject) {
        const updated = await httpReq.patch(`/v3/folders/${folder.id}`, { payload: patchObject });
        updateFolder(folder, updated);
    }

    function updateFolder(folder, update) {
        folders[folder.key] = {
            ...folders[folder.key],
            ...update,
            path: getFolderUri(update)
        };
        const queue = folders[folder.key].children || [];
        while (queue.length) {
            const child = queue.shift();
            const childUpdate = {
                ...child,
                teamId: update.teamId,
                userId: update.userId
            };
            folders[child.key] = {
                ...childUpdate,
                path: getFolderUri(childUpdate)
            };
            queue.push.apply(queue, childUpdate.children || []);
        }
        refreshFolders();
    }

    async function loadCharts(force = false) {
        const query = `/charts?minLastEditStep=2&offset=${offset}&limit=${limit}&${
            curSearch
                ? `search=${encodeURIComponent(curSearch)}`
                : `folderId=${folderId ? folderId : 'null'}${
                      teamId ? `&teamId=${teamId}` : '&authorId=me'
                  }`
        }`;
        if (query !== apiQuery || force) {
            apiQuery = query;
            charts = await httpReq.get(`/v3${query}`);
            $selectedCharts = new Set();
        }
    }

    function refreshFolders() {
        folders = folders;
        $currentFolder = folders[$currentFolder.key];
    }

    async function duplicateChart(chart, openInNewTab = false) {
        const res = await httpReq.post(`/v3/charts/${chart.id}/copy`);
        if (openInNewTab) {
            window.open(`/chart/${res.id}/visualize`, '_blank');
        }
        $currentFolder.chartCount++;
        loadCharts(true);
        refreshFolders();
    }

    async function deleteChart(chart) {
        if (window.confirm(__('archive / chart / delete / confirm'))) {
            await httpReq.delete(`/v3/charts/${chart.id}`);
            $currentFolder.chartCount--;
            loadCharts(true);
            refreshFolders();
        }
    }

    async function openChart(chart) {
        currentChart = await httpReq.get(
            `/v3/charts/${typeof chart === 'string' ? chart : chart.id}`
        );
        currentChartOpen = true;
    }

    async function moveFolder(folder, destinationFolder) {
        if (!folder) {
            return;
        }
        if (folder.key === destinationFolder.key) {
            return;
        }
        try {
            await patchFolder(folder, {
                parentId: destinationFolder.id,
                teamId: destinationFolder.teamId || null
            });
        } catch (err) {
            window.alert(err.message);
        }
    }

    async function handleDragStart(event, type, object) {
        event.dataTransfer.setData(type, JSON.stringify(object));
        draggedObject = {
            type,
            object
        };
    }

    async function handleDrop(event, destinationFolder) {
        const folderData = event.dataTransfer.getData('folder');
        if (folderData) {
            await moveFolder(JSON.parse(folderData), destinationFolder);
        }
        draggedObject = undefined;
        dragNotification = undefined;
        $folderTreeDropZone = undefined;
    }

    async function handleDragEnter(event, destinationFolder) {
        if (!draggedObject) {
            return;
        }
        dragDestination = destinationFolder;
        dragTarget = event.target;
        if (draggedObject.object.teamId !== destinationFolder.teamId) {
            dragNotification = destinationFolder.teamId
                ? __('mycharts / confirm-move-folder-to-org').replace(
                      '%s',
                      teams.find(t => t.id === destinationFolder.teamId).name
                  )
                : __('mycharts / confirm-move-folder-to-user');
        }
    }

    async function handleDragLeave(event) {
        if (!event.target.isEqualNode(dragTarget)) {
            return;
        }
        dragNotification = undefined;
        dragTarget = undefined;
    }

    let _prevOffset = offset;
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

        if (_prevOffset !== offset || _prevFolder !== $currentFolder) {
            // if folder has changed, reset pagination to first step:
            if (_prevFolder !== $currentFolder) {
                offset = 0;
            }

            _prevOffset = offset;
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
    {#if dragNotification}
        <DragNotification {__} message={dragNotification} />
    {/if}
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
                        <CollapseGroup className="search" title={__('archive / section / search')}>
                            <Folder {__} folder={$currentFolder} />
                        </CollapseGroup>
                    {/if}
                    <CollapseGroup className="shared" title={__('archive / section / shared')}>
                        {#each sortedTeamFolders as teamFolder, i}
                            {#if i}<hr class="my-3" />{/if}
                            <Folder {__} folder={teamFolder} />
                        {/each}
                    </CollapseGroup>

                    <CollapseGroup className="private" title={__('archive / section / private')}>
                        <Folder {__} folder={userFolder} />
                    </CollapseGroup>
                </div>
                <div class="column">
                    <ActionBar {__} charts={charts.list} {folderId} {teamId} />
                    {#if !$currentFolder.search}
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
