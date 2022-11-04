<script>
    import LoadingSpinnerDisplay from '_partials/displays/LoadingSpinnerDisplay.svelte';
    import { onMount, getContext } from 'svelte';
    import Parser from 'rss-parser/dist/rss-parser';
    import IconBox from '_partials/displays/IconBox.svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';

    const allowedTags = [
        'a',
        'figure',
        'span',
        'b',
        'br',
        'i',
        'strong',
        'sup',
        'sub',
        'strike',
        'u',
        'em',
        'tt',
        'img',
        'ul',
        'li'
    ];
    const { dayjs } = getContext('libraries');

    export let __;
    export let changelogFeed;
    export let changelogUrl;

    let error = false;
    let items = [];

    onMount(async () => {
        if (!changelogFeed) return;
        const parser = new Parser();
        try {
            const feed = await parser.parseURL(changelogFeed);
            items = feed.items;
        } catch (e) {
            error = e;
        }
    });
</script>

<style>
    .content :global(figure) {
        margin-top: 1ex;
        margin-left: 0;
        margin-right: 0;
    }
</style>

{#if !error}
    <IconBox icon="rocket">
        <a slot="title" target="_blank" href={changelogUrl}>{__('dashboard / changelog')}</a>
        <div>
            {#if !items.length}
                <div class="has-text-grey">
                    <LoadingSpinnerDisplay />
                    {__('dashboard / changelog / loading')}
                </div>
            {:else}
                {#each items.slice(0, 6) as item}
                    <article class="block" data-uid="changelog-item">
                        <div class="has-text-grey-dark is-size-7 is-uppercase mb-1">
                            {@html purifyHtml(item.title.split(' / ')[1])} — {dayjs(
                                item.title.split(' / ')[0]
                            ).fromNow()}
                        </div>
                        <div class="content">{@html purifyHtml(item.content, allowedTags)}</div>
                    </article>
                {/each}
            {/if}
            <a href={changelogUrl} target="_blank">{__('dashboard / changelog / see-all')}</a>
        </div>
    </IconBox>
{/if}
