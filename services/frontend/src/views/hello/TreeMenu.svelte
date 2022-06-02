<script>
    import { getContext } from 'svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import truncate from '@datawrapper/shared/truncate';

    const request = getContext('request');

    export let groups = [];
    export let sticky = false;
    export let compact = false;
    export let content = null;
    export let loadPage;

    function getTopMostElement(scrollY, groups, content) {
        let topMost;
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            for (let j = 0; j < group.pages.length; j++) {
                const page = group.pages[j];
                if (page.url.startsWith('#')) {
                    const el = content.querySelector(page.url);
                    if (el) {
                        const { top } = el.getBoundingClientRect();
                        if (!topMost || top < 30) {
                            topMost = page;
                        }
                        // check last page
                        if (
                            i === groups.length - 1 &&
                            j === group.pages.length - 1 &&
                            innerHeight + scrollY >= content.ownerDocument.body.offsetHeight - 2
                        )
                            topMost = page;
                    }
                }
            }
        }
        return topMost;
    }

    function isActive(page, scrollY, groups, content, req) {
        if (sticky && page.url.startsWith('#') && content) {
            // check if target is the top most item
            const topItem = getTopMostElement(scrollY, groups, content);
            return topItem === page;
        }
        return (
            req.path === page.url ||
            req.path.startsWith(`${page.url}/`) ||
            (page.url.startsWith('#') && req.hash === page.url)
        );
    }

    function pageClick(page) {
        if (typeof loadPage === 'function') {
            loadPage(page);
        } else {
            window.location.href = page.url;
        }
    }

    let scrollY;
    let innerHeight;
</script>

<style lang="scss">
    @import '../../styles/export.scss';

    .menu-label {
        margin-bottom: 0.5em;
        color: $dw-grey-darker;

        :global(.icon) {
            transform-origin: center;
            font-size: 12px;
            transition: transform 0.2s;
            transition-timing-function: ease-out;
            position: relative;
        }
        :global(.icon svg) {
            font-size: 0.85em;
        }

        &.open :global(.icon) {
            transform: rotate(90deg);
        }
    }

    .menu-list {
        li {
            a {
                padding: 0.3em 0.5em;

                color: $dw-grey-darker;

                &.is-active {
                    background: transparent;
                    font-weight: bold;
                    color: $dw-black-bis;
                }
            }
        }
    }
</style>

<svelte:window bind:scrollY bind:innerHeight />

<aside class="menu">
    {#each groups as g}
        <div class="block">
            {#if g.title && g.title !== 'null'}
                <h3
                    class="menu-label"
                    class:open={!g.collapsed}
                    on:click={() => (g.collapsed = !g.collapsed)}
                >
                    <IconDisplay icon="disclosure" valign="baseline" />
                    {@html g.title}
                </h3>
            {/if}
            {#if !g.collapsed}
                <ul role="navigation" class="menu-list">
                    {#each g.pages as page}
                        {#if page.url}
                            <li>
                                <a
                                    class:is-active={isActive(
                                        page,
                                        scrollY,
                                        groups,
                                        content,
                                        $request
                                    )}
                                    on:click|preventDefault={() => pageClick(page)}
                                    href={page.url}
                                    ><IconDisplay
                                        className="mr-3"
                                        icon={page.svgIcon || 'workflow'}
                                    /><span
                                        >{#if page.escape}{truncate(
                                                page.title
                                            )}{:else}{@html truncate(page.title)}{/if}</span
                                    ></a
                                >
                            </li>
                        {/if}
                    {/each}
                </ul>
            {/if}
        </div>
    {/each}
</aside>
