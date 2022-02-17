<script>
    import decodeHtml from '@datawrapper/shared/decodeHtml';
    import { getContext, createEventDispatcher } from 'svelte';
    const config = getContext('config');
    const dispatch = createEventDispatcher();

    export let link;
    export let chart;

    $: thumbnail =
        (chart.thumbnails && chart.thumbnails.plain) ||
        `//${$config.imageDomain}/${chart.id}/${chart.thumbnailHash}/plain.png`;
</script>

<style lang="scss">
    @import '../../../styles/colors.scss';
    .title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        min-height: 1em;
    }
    .box {
        border: 1px solid $dw-grey-lighter;
        padding: 20px 25px;
        box-shadow: none;
        margin-bottom: 0;
    }
    .box:hover {
        border: 1px solid $dw-grey;
    }

    .subline {
        line-height: 1.2;
    }

    .thumb {
        width: 100%;
        padding-bottom: 75%;
        background-size: cover;
    }
</style>

<div class="box has-border">
    <a on:click={event => dispatch('click', { event, chart, link })} href={link}>
        <figure class="image is-4by3">
            <figcaption
                title={decodeHtml(chart.title)}
                class="title is-size-6 is-size-5-desktop is-font-weight-medium mb-2"
            >
                {decodeHtml(chart.title)}
            </figcaption>
            <slot name="belowTitle" />
            <div class="thumb" style="background-image: url({thumbnail})" />
        </figure></a
    >
    <slot name="footer" />
</div>
