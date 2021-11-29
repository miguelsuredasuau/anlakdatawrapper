<script>
    import { getContext } from 'svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    const request = getContext('request');

    export let groups = [];
    export let sticky = false;
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
        return req.path === page.url;
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
    .menu.sticky {
        position: sticky;
        top: 20px;
    }

    .menu-label {
        font-weight: 700;
    }
    .menu-list {
        border: 1px solid $dw-grey-lighter;
        border-radius: $radius;

        li:not(:last-of-type) {
            border-bottom: 1px solid $dw-grey-lighter;
        }
        li:first-of-type a {
            border-radius: $radius $radius 0 0;
        }
        li:last-of-type a {
            border-radius: 0 0 $radius $radius;
        }
        a {
            &.is-active {
                font-weight: bold;
            }
            :global(.icon) {
                font-size: 20px;
            }
        }
    }
</style>

<svelte:window bind:scrollY bind:innerHeight />

<aside class="menu" class:sticky>
    {#each groups as g}
        <div class="block">
            {#if g.title}
                <h3 class="menu-label">
                    {@html g.title}
                </h3>
            {/if}
            <ul role="navigation" class="menu-list">
                {#each g.pages as page}
                    <li>
                        <a
                            class:is-active={isActive(page, scrollY, groups, content, $request)}
                            on:click|preventDefault={() => pageClick(page)}
                            href={page.url}
                            >{#if page.svgIcon}<IconDisplay
                                    className="mr-2"
                                    icon={page.svgIcon}
                                />{/if}<span>{@html page.title}</span></a
                        >
                    </li>
                {/each}
            </ul>
        </div>
    {/each}
</aside>
