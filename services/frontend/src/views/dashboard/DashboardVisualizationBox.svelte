<script>
    import VisualizationBoxDisplay from '_partials/displays/VisualizationBoxDisplay.svelte';
    import { getContext } from 'svelte';
    const { dayjs } = getContext('libraries');

    export let chart;
    export let __;

    export let sortField = 'last_modified_at';

    $: dateLine =
        sortField === 'last_modified_at'
            ? `${__('dashboard / visualization / last-edited')} ${dayjs(
                  chart.last_modified_at
              ).fromNow()}`
            : sortField === 'published_at'
            ? `${__('dashboard / visualization / published')} ${dayjs(
                  chart.published_at
              ).fromNow()}`
            : '';
</script>

<style lang="scss">
    @import '../../styles/colors.scss';

    .subline {
        line-height: 1.2;
    }
</style>

<VisualizationBoxDisplay link={`/chart/${chart.id}/edit`} {chart}>
    <div slot="footer">
        {#if dateLine}
            <div class="subline mt-2 has-text-grey-dark is-size-7">{dateLine}</div>
        {/if}
    </div>
</VisualizationBoxDisplay>
