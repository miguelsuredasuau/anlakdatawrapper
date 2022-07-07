<script type="text/javascript">
    import ActionBar from './ActionBar.svelte';
    import CollapseGroup from './CollapseGroup.svelte';
    import DragNotification from './DragNotification.svelte';
    import Folder from './Folder.svelte';
    import FolderBreadcrumbNav from './FolderBreadcrumbNav.svelte';
    import MainLayout from '_layout/MainLayout.svelte';
    import Pagination from '_partials/Pagination.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import SearchInput from './SearchInput.svelte';
    import SubFolderGrid from './SubFolderGrid.svelte';
    import VisualizationGrid from './VisualizationGrid.svelte';
    import VisualizationModal from './VisualizationModal.svelte';
    import httpReq from '@datawrapper/shared/httpReq';
    import decodeHtml from '@datawrapper/shared/decodeHtml';
    import isEqual from 'underscore/modules/isEqual.js';
    import {
        currentFolder,
        folderTreeDropZone,
        subfolderGridDropZone,
        query,
        selectedCharts,
        chartsLoading
    } from './stores';
    import { headerProps } from '_layout/stores';
    import { groupCharts } from '../../utils/charts.cjs';
    import { onMount, getContext, setContext } from 'svelte';
    import { parseFolderTree, getFolderUri } from './shared';
    import { DEFAULT_SORT_ORDER } from './constants';

    const user = getContext('user');
    const request = getContext('request');

    export let __;

    export let apiQuery;
    export let charts;
    export let teams;
    export let folders;
    export let themeBgColors;
    export let minLastEditStep = 2;
    export let foreignTeam;
    export let visBoxSublines;
    export let visModalMetadata;

    /*
     * we're using a "page context" here to be able to make
     * our helper methods available to all sub components of this
     * view without having to pass them around as state props.
     */
    setContext('page/archive', {
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
        closeChart,
        moveCharts,
        moveFolder,
        themeBgColors,
        foreignTeam,
        teams,
        visBoxSublines,
        visModalMetadata
    });

    const virtualFolder = {
        id: null,
        teamId: null,
        children: [],
        virtual: true,
        level: 0
    };
    const virtualFolders = [
        {
            ...virtualFolder,
            key: 'recently-edited',
            path: '/archive/recently-edited',
            name: __('dashboard / recent-drafts / title'),
            apiURL: '/v3/me/recently-edited-charts',
            forceOrder: {
                orderBy: 'lastModifiedAt',
                order: 'DESC'
            }
        },
        {
            ...virtualFolder,
            key: 'recently-published',
            path: '/archive/recently-published',
            name: __('dashboard / recently-published / title'),
            apiURL: '/v3/me/recently-published-charts',
            forceOrder: {
                orderBy: 'publishedAt',
                order: 'DESC'
            }
        }
    ];

    $: userFolder = parseFolderTree(folders);
    $: teamFolders = teams.map(t => parseFolderTree(folders, t.id));

    // Initialize stores with backend data.
    $currentFolder = findFolderByPath(folders, $request.path);
    $query = apiQuery;

    // Current folder
    $: folderId = $currentFolder.id;
    $: teamId = $currentFolder.teamId;

    // Current chart
    let currentChart;
    let dragNotification;
    let dragTarget;
    let draggedObject;

    setContext('page/archive/drag-and-drop', {
        handleDragStart,
        handleDrop,
        handleDragEnter,
        handleDragLeave
    });

    // Load charts when current folder or query changes.
    let _prevPath = $currentFolder.path;
    $: if ($currentFolder.path !== _prevPath || !isEqual($query, apiQuery)) {
        if ($currentFolder.path !== _prevPath) {
            // if folder has changed, reset pagination to first step:
            $query = { ...$query, offset: 0 };
        }
        _prevPath = $currentFolder.path;
        apiQuery = $query;
        if ($currentFolder.forceOrder) {
            // some virtual folders force a certain order
            $query.orderBy = $currentFolder.forceOrder.orderBy;
            $query.order = $currentFolder.forceOrder.order;
        }

        const qs = new URLSearchParams({
            ...(limit && limit !== 96 && { limit }),
            ...($query.offset && { offset: $query.offset }),
            ...($query.groupBy && { groupBy: $query.groupBy }),
            ...($query.order &&
                $query.order !== DEFAULT_SORT_ORDER[$query.orderBy] && { order: $query.order }),
            ...($query.orderBy &&
                $query.orderBy !== 'lastModifiedAt' && { orderBy: $query.orderBy }),
            ...($query.search && { search: $query.search })
        });

        if ($currentFolder.path) {
            const path = $currentFolder.path + (qs && '?') + qs;
            const state = window.history.state || {};
            if (state.path !== path) {
                window.history.pushState({ path }, '', path);
            }
            loadCharts();
        }
    }

    // Pagination
    $: total = charts.total;
    const limit = $query.limit;
    $: offset = $query.offset;

    function changeOffset(offset) {
        $query = { ...$query, offset };
    }

    let folderNavEl;
    $: if (folderNavEl) {
        const padding = 10;
        const { isSticky, height } = $headerProps;
        folderNavEl.style.top = `${isSticky ? height + padding : padding}px`;
    }

    onMount(() => {
        const chartId = getChartIdFromHash();
        if (chartId) {
            openChart(chartId, false);
        }

        window.addEventListener('popstate', ({ state }) => {
            // Handle browser history for folders:
            $currentFolder = findFolderByPath(folders, window.location.pathname);

            // Handle browser history for charts:
            const chartId = (state && state.chartId) || getChartIdFromHash();
            if (chartId) {
                openChart(chartId, false);
            } else {
                closeChart(false);
            }
        });
    });

    function getChartIdFromHash() {
        const chartHashRegex = /^#\/([a-z0-9]{5})$/i;
        const match = window.location.hash.match(chartHashRegex);
        return match && match[1];
    }

    function findFolderByPath(folders, path) {
        for (const f of [...Object.values(folders), ...virtualFolders]) {
            if (f.path === path) {
                return f;
            }
        }
        return {};
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

    async function loadCharts() {
        const { groupBy, limit, offset, order, orderBy, search } = $query;
        const qs = $currentFolder.apiURL
            ? new URLSearchParams({
                  offset,
                  limit
              })
            : search
            ? new URLSearchParams({
                  offset,
                  limit,
                  orderBy,
                  order,
                  query: search
              })
            : new URLSearchParams({
                  offset,
                  limit,
                  orderBy,
                  order,
                  minLastEditStep,
                  folderId: folderId || 'null',
                  ...(teamId ? { teamId } : { authorId: 'me', teamId: 'null' })
              });
        try {
            $chartsLoading = true;
            const newCharts = await httpReq.get(
                $currentFolder.apiURL
                    ? `${$currentFolder.apiURL}?${qs}`
                    : search
                    ? `/v3/search/charts?${qs}`
                    : `/v3/charts?${qs}`
            );
            if (groupBy) {
                newCharts.list = groupCharts({ charts: newCharts.list, groupBy, __ });
            }
            if (!newCharts.list.length && /[a-zA-Z0-9]{5}/.test(search)) {
                // search for specific chart id
                try {
                    const chart = await httpReq.get(`/v3/charts/${search}`);
                    newCharts.list.push(chart);
                    newCharts.total = 1;
                } catch (e) {
                    // ignore error
                }
            }
            charts = newCharts;
            $selectedCharts = new Set();
        } catch (e) {
            window.alert(__('archive / search / error'));
        } finally {
            $chartsLoading = false;
        }
    }

    function refreshFolders() {
        folders = folders;

        const _currentFolder = folders[$currentFolder.key];
        if (_currentFolder) {
            $currentFolder = _currentFolder;
        }
    }

    async function duplicateChart(chart, openInNewTab = false) {
        const res = await httpReq.post(`/v3/charts/${chart.id}/copy`);
        if (openInNewTab) {
            window.open(`/chart/${res.id}/visualize`, '_blank');
        }
        $currentFolder.chartCount++;
        loadCharts();
        refreshFolders();
    }

    async function deleteChart(chart) {
        if (window.confirm(__('archive / chart / delete / confirm'))) {
            await httpReq.delete(`/v3/charts/${chart.id}`);
            $currentFolder.chartCount--;
            loadCharts();
            refreshFolders();
        }
    }

    async function moveCharts(chartsToMove, folder) {
        const payload = {
            ids: chartsToMove.map(({ id }) => id),
            patch: { folderId: folder.id, ...(folder.teamId ? { teamId: folder.teamId } : {}) }
        };

        try {
            await httpReq.patch('/v3/charts', { payload });
            // "remove" charts from source folders counts
            chartsToMove.map(({ id }) => {
                const chart = charts.list.find(c => c.id === id);
                const srcFolder = folders[chart.folderId || chart.organizationId || '$user'];
                srcFolder.chartCount--;
            });
            loadCharts(true);
            // add charts to target folder
            folder.chartCount += chartsToMove.length;

            refreshFolders();
        } catch (err) {
            window.alert(err);
            console.error(err);
        }
    }

    async function openChart(chartId, pushState = true) {
        currentChart = await httpReq.get(`/v3/charts/${chartId}`);
        if (pushState) {
            const path = window.location.pathname + (window.location.search || '');
            window.history.pushState({ chartId }, '', `${path}#/${chartId}`);
        }
    }

    function closeChart(pushState = true) {
        currentChart = null;
        if (pushState) {
            const path = window.location.pathname + (window.location.search || '');
            window.history.pushState({ chartId: null }, '', path);
        }
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

    async function handleDragStart(type, object) {
        draggedObject = {
            type,
            object
        };
    }

    async function handleDrop(destinationFolder) {
        if (draggedObject.type === 'folder') {
            await moveFolder(draggedObject.object, destinationFolder);
        }

        if (draggedObject.type === 'charts') {
            await moveCharts(draggedObject.object, destinationFolder);
        }

        draggedObject = undefined;
        dragNotification = undefined;
        $folderTreeDropZone = undefined;
        $subfolderGridDropZone = undefined;
    }

    async function handleDragEnter(event, destinationFolder) {
        if (!draggedObject) {
            return;
        }
        dragTarget = event.target;
        const teamName = () => decodeHtml(teams.find(t => t.id === destinationFolder.teamId).name);

        if (draggedObject.type === 'folder') {
            if (draggedObject.object.teamId !== destinationFolder.teamId) {
                dragNotification = destinationFolder.teamId
                    ? __('mycharts / confirm-move-folder-to-org', 'core', { s: teamName() })
                    : __('mycharts / confirm-move-folder-to-user');
            }
        }

        if (draggedObject.type === 'charts') {
            const [chart] = draggedObject.object;
            if (chart.organizationId !== destinationFolder.teamId) {
                dragNotification = destinationFolder.teamId
                    ? __('mycharts / confirm-move-chart-to-org', 'core', { s: teamName() })
                    : __('mycharts / confirm-move-chart-to-user');
            }
        }
    }

    async function handleDragLeave(event) {
        if (!event.target.isEqualNode(dragTarget)) {
            return;
        }
        dragNotification = undefined;
        dragTarget = undefined;
    }

    $: sortedTeamFolders = teamFolders.sort((a, b) => {
        if (foreignTeam) {
            // show foreign team on top
            if (a.teamId === foreignTeam) return -1;
            if (b.teamId === foreignTeam) return 1;
        }
        if ($user.activeTeam) {
            if (a.teamId === $user.activeTeam.id) return -1;
            if (b.teamId === $user.activeTeam.id) return 1;
        }
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    .section {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
    .team-message {
        padding: 1rem;
        color: $dw-grey-dark;
        border: 1px dashed $dw-grey-light;
    }
</style>

<MainLayout title="{$currentFolder.name || ''} - Archive">
    <VisualizationModal {__} bind:chart={currentChart} />
    {#if dragNotification}
        <DragNotification {__} message={dragNotification} />
    {/if}
    <section class="section header py-5">
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
    <section class="section body pt-5">
        <div class="container">
            <div class="columns is-variable is-8-fullhd">
                <div class="column" style="position: relative; z-index: 20;">
                    <div bind:this={folderNavEl} style="position: sticky;">
                        <CollapseGroup className="search" title={__('archive / section / search')}
                            >{#if $currentFolder.search && $currentFolder.search !== true}
                                <Folder {__} folder={$currentFolder} />
                                <hr class="my-3" />
                            {/if}
                            {#each virtualFolders as folder}
                                <Folder {__} {folder} />
                            {/each}
                        </CollapseGroup>

                        <CollapseGroup className="shared" title={__('archive / section / shared')}>
                            {#each sortedTeamFolders as teamFolder, i}
                                {#if i}<hr class="my-3" />{/if}
                                {#if foreignTeam && teamFolder.teamId === foreignTeam}
                                    <MessageDisplay type="danger">
                                        <p>
                                            <strong>Heads up!</strong> You are not a member of team
                                            <b>{teamFolder.name}</b>. You can only see it because
                                            you have admin privileges! Please do not change anything
                                            unless you know exactly what you're doing
                                        </p>
                                    </MessageDisplay>
                                {/if}
                                <Folder {__} folder={teamFolder} />
                            {:else}
                                <div class="team-message">
                                    <p class="pb-1">
                                        {__('archive / section / shared / team-message')}
                                    </p>
                                    <a href="/account/teams">
                                        {__('archive / section / shared / team-link')}
                                    </a>
                                </div>
                            {/each}
                        </CollapseGroup>
                        <CollapseGroup
                            className="private"
                            title={__('archive / section / private')}
                        >
                            <Folder {__} folder={userFolder} />
                        </CollapseGroup>
                    </div>
                </div>
                <div class="column is-three-quarters">
                    <ActionBar {__} charts={charts.list} {folderId} {teamId} {apiQuery} />
                    {#if !$currentFolder.search}
                        <div class="subfolders block">
                            <SubFolderGrid {__} />
                        </div>
                    {/if}
                    <div class="block">
                        {#if total > 0}
                            {#if Array.isArray(charts.list)}
                                <VisualizationGrid {__} charts={charts.list} />
                            {:else}
                                {#each Object.keys(charts.list) as groupTitle (groupTitle)}
                                    <h3 class="is-size-4 has-text-grey mb-3">{groupTitle}</h3>
                                    <VisualizationGrid {__} charts={charts.list[groupTitle]} />
                                {/each}
                            {/if}
                            <Pagination {changeOffset} {limit} {offset} {total} />
                        {:else}
                            <p
                                class="subtitle is-size-4 has-text-grey pt-6 has-text-centered-tablet"
                            >
                                {@html __('mycharts / empty-folder', 'core', {
                                    location: folderId
                                        ? `?folder=${folderId}`
                                        : teamId
                                        ? `?team=${teamId}`
                                        : ''
                                })}
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </section>
</MainLayout>
