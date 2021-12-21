<script>
    import DashboardVisualizationBox from './DashboardVisualizationBox.svelte';
    import { getContext } from 'svelte';
    const user = getContext('user');

    export let __;
    export let recentlyEdited;
    export let recentlyPublished;

    $: archiveLink = $user && $user.activeTeam ? `/team/${$user.activeTeam.id}` : `/mycharts`;
</script>

<div class="block mb-6">
    <h2 class="title is-3"><a href={archiveLink}>{__('dashboard / recent-drafts / title')}</a></h2>
    <div class="columns is-multiline is-mobile">
        {#each recentlyEdited as chart}
            <div class="column is-one-third-desktop is-half-tablet is-half-mobile">
                <DashboardVisualizationBox {__} sortField="last_modified_at" {chart} />
            </div>
        {/each}
    </div>
</div>
<div class="block mb-6">
    <h2 class="title is-3">
        <a href={archiveLink}>{__('dashboard / recently-published / title')}</a>
    </h2>
    <div class="columns is-multiline is-mobile">
        {#each recentlyPublished as chart}
            <div class="column is-one-third-desktop is-half-tablet is-half-mobile">
                <DashboardVisualizationBox {__} sortField="published_at" {chart} />
            </div>
        {/each}
    </div>
</div>
