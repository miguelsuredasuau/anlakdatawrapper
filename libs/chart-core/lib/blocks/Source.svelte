<script>
    import { isAllowedSourceUrl } from '@datawrapper/shared/validation.js';

    // external props
    export let props;
    const { __, get, purifyHtml } = props;
    $: ({ chart, themeData, postEvent } = props);

    // internal props
    $: caption = get(themeData, 'options.blocks.source.data.caption', __('Source'));
    $: sourceName = get(chart, 'metadata.describe.source-name');
    $: sourceUrl = get(chart, 'metadata.describe.source-url');
    $: allowedSourceUrl = isAllowedSourceUrl(sourceUrl);

    function handleClick() {
        postEvent('source.click', { url: sourceUrl, name: sourceName });
    }
</script>

{#if sourceName}
    {#if caption}<span class="source-caption">{caption}:</span>{/if}
    {#if sourceUrl && allowedSourceUrl}
        <a
            on:click={handleClick}
            class="source"
            target="_blank"
            rel="nofollow noopener noreferrer"
            href={sourceUrl}
        >
            {@html purifyHtml(sourceName)}
        </a>
    {:else}
        <span class="source" title={sourceUrl && !allowedSourceUrl ? sourceUrl : null}>
            {@html purifyHtml(sourceName)}
        </span>
    {/if}
{/if}
