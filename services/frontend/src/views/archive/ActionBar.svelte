<script>
    import SvgIcon from '../layout/partials/SvgIcon.svelte';
    import { selectedCharts } from './stores';

    export let __;
    export let charts;

    function selectAll() {
        $selectedCharts = new Set(charts);
    }

    function deselectAll() {
        $selectedCharts = new Set();
    }
</script>

<div class="level block has-text-grey">
    <div class="level-left">
        {#if $selectedCharts.size}
            <div class="level-item mr-0">
                <strong class="has-text-grey mr-1">{$selectedCharts.size}</strong>
                {__('archive / action-bar / selected')}
            </div>
            <div class="level-item">
                <button
                    class="button is-ghost"
                    on:click={deselectAll}
                    title={__('archive / action-bar / deselect-all')}
                    aria-label={__('archive / action-bar / deselect-all')}
                >
                    <SvgIcon icon="close" className="is-small has-text-grey" />
                </button>
            </div>
        {:else}
            <div class="level-item">
                <button
                    class="button is-text has-text-grey-dark"
                    style="text-decoration:none"
                    on:click={selectAll}
                >
                    <SvgIcon icon="check-all" className="is-small has-text-grey" />
                    <span>{__('archive / action-bar / select-all')}</span>
                </button>
            </div>
        {/if}
    </div>
</div>
