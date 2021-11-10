<script>
    import CheckboxInput from '../_partials/controls/CheckboxInput.svelte';
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    import { getContext } from 'svelte';
    import { selectedCharts } from './stores';
    const config = getContext('config');
    const { dayjs } = getContext('libraries');
    const { openVisualization } = getContext('page/archive');

    export let chart;
    export let __;

    export let sortField = 'last_modified_at';

    $: selected = $selectedCharts.has(chart);

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

    $: thumbnail =
        (chart.thumbnails && chart.thumbnails.plain) ||
        `//${$config.imageDomain}/${chart.id}/${chart.thumbnailHash}/plain.png`;

    function toggleChart() {
        if (selected) {
            if ($selectedCharts.delete(chart)) {
                $selectedCharts = $selectedCharts;
            }
        } else {
            $selectedCharts = $selectedCharts.add(chart);
        }
    }
</script>

<style lang="scss">
    @import '../../styles/colors.scss';

    .title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .box {
        position: relative;
        border: 1px solid $dw-grey-lighter;
        padding: 10px;
        box-shadow: none;

        a {
            display: block;
            padding: 15px;
            padding-bottom: 5px;
            background: $dw-white;
        }
        &:hover {
            border-color: $dw-grey;
            background-color: $dw-grey-lightest;
        }
        &.selected {
            border-color: $dw-scooter-light;
            background-color: $dw-scooter-lightest;
        }
    }
    .box-checkbox {
        display: none;
        position: absolute;
        left: 3px;
        top: 3px;
        padding: 5px;
        border-radius: 4px;
        line-height: 14px;

        .box:hover & {
            display: block;
            background-color: $dw-grey-lightest;
        }
        .box.selected & {
            display: block;
        }
        .box.selected:hover & {
            background-color: transparent;
        }
    }
</style>

<div class="box has-border" class:selected>
    <a on:click|preventDefault={() => openVisualization(chart)} href="/chart/{chart.id}/edit">
        <figure class="image is-4by3">
            <figcaption title={purifyHTML(chart.title, '')} class="title is-6 mb-2">
                {purifyHTML(chart.title, '')}
            </figcaption>
            <img alt="preview" src={thumbnail} />
        </figure>
        {#if dateLine}
            <div class="mt-2 has-text-grey-dark is-size-7">{dateLine}</div>
        {/if}
    </a>
    <div class="box-checkbox">
        <CheckboxInput
            value={selected}
            on:click={toggleChart}
            label={__('dashboard / visualization / select')}
            standalone
        />
    </div>
</div>
