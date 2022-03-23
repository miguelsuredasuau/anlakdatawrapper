<script>
    import AddInFolder from './AddInFolder.svelte';
    import ArrangeDropdown from './ArrangeDropdown.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { selectedCharts } from './stores';

    export let __;
    export let charts;
    export let folderId;
    export let teamId;
    export let apiQuery;

    function selectAll() {
        $selectedCharts = new Set(charts);
    }

    function deselectAll() {
        $selectedCharts = new Set();
    }
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
</style>

<div class="level block has-text-grey-dark">
    <div class="level-left">
        <div class="level-item">
            <AddInFolder {__} {folderId} {teamId} />
        </div>
        {#if $selectedCharts.size}
            <div class="level-item ml-3 mr-1">
                <strong class="mr-1 has-text-grey-dark">{$selectedCharts.size}</strong>
                {__('archive / action-bar / selected')}
            </div>
            <div class="level-item">
                <button
                    class="button is-text"
                    on:click={deselectAll}
                    title={__('archive / action-bar / deselect-all')}
                    aria-label={__('archive / action-bar / deselect-all')}
                >
                    <IconDisplay icon="close" size="1em" />
                </button>
            </div>
        {:else}
            <div class="level-item">
                <button class="button is-text" on:click={selectAll}>
                    <IconDisplay icon="check-all" />
                    <span>{__('archive / action-bar / select-all')}</span>
                </button>
            </div>
        {/if}
    </div>
    <div class="level-right">
        <ArrangeDropdown {__} {apiQuery} />
    </div>
</div>
<hr class="mb-5" />
