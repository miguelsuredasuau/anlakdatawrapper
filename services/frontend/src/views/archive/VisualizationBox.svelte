<script>
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    import { getContext } from 'svelte';
    const config = getContext('config');
    const { dayjs } = getContext('libraries');
    const { openVisualization } = getContext('page/archive');

    export let chart;
    export let __;

    export let sortField = 'last_modified_at';

    $: dateLine =
        sortField === 'last_modified_at'
            ? `${__('dashboard / visualiztion / last-edited')} ${dayjs(
                  chart.last_modified_at
              ).fromNow()}`
            : sortField === 'published_at'
            ? `${__('dashboard / visualiztion / published')} ${dayjs(chart.published_at).fromNow()}`
            : '';

    $: thumbnail =
        (chart.thumbnails && chart.thumbnails.plain) ||
        `//${$config.imageDomain}/${chart.id}/${chart.thumbnailHash}/plain.png`;
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    .title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .box {
        border: 1px solid $dw-grey-lighter;
        padding: 20px 25px;
        box-shadow: none;
    }
    .box:hover {
        border: 1px solid $dw-scooter-light;
    }
</style>

<div class="box has-border">
    <a on:click|preventDefault={() => openVisualization(chart)} href="/chart/{chart.id}/edit">
        <figure class="image is-4by3">
            <figcaption title={purifyHTML(chart.title, '')} class="title is-6 mb-2">
                {purifyHTML(chart.title, '')}
            </figcaption>
            <img alt="preview" src={thumbnail} />
        </figure></a
    >
    {#if dateLine}
        <div class="mt-2 has-text-grey-dark is-size-7">{dateLine}</div>
    {/if}
</div>
