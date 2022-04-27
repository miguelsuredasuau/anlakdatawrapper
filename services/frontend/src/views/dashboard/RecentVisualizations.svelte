<script>
    import DashboardVisualizationBox from './DashboardVisualizationBox.svelte';

    export let __;
    export let recentlyEdited;
    export let recentlyPublished;
</script>

<div class="block mb-6">
    <h2 class="title is-3">
        <a href="/archive/recently-edited">{__('dashboard / recent-drafts / title')}</a>
    </h2>
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
        <a href="/archive/recently-published">{__('dashboard / recently-published / title')}</a>
    </h2>
    <div class="columns is-multiline is-mobile">
        {#each recentlyPublished as chart}
            <div class="column is-one-third-desktop is-half-tablet is-half-mobile">
                <DashboardVisualizationBox {__} sortField="published_at" {chart} />
            </div>
        {/each}
    </div>
</div>
