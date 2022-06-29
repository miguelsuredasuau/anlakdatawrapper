<script>
    import { getContext } from 'svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import truncate from '@datawrapper/shared/truncate';
    import purifyHtml from '@datawrapper/shared/purifyHtml';

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
            .icon {
                width: auto;
                height: auto;
                font-size: 1.2em;
                vertical-align: -0.2em;

                svg {
                    width: 1em;
                    height: 1em;
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
                    {@html purifyHtml(g.title)}
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
                                >
                                    {#if page.svgIcon}
                                        <IconDisplay className="mr-1" icon={page.svgIcon} />
                                    {:else}
                                        <span class="icon mr-1">
                                            <svg
                                                viewBox="0 0 30 30"
                                                fill="currentColor"
                                                xmlns="http://www.w3.org/2000/svg"
                                                ><path
                                                    d="M14.963 2a1 1 0 0 0-.41.105l-10 5A1 1 0 0 0 4 8v11.662a1 1 0 0 0 .465.844l10 6.338a1 1 0 0 0 1.07 0l10-6.338a1.002 1.002 0 0 0 .465-.844V8a1 1 0 0 0-.553-.895l-10-5A1 1 0 0 0 14.963 2ZM15 4.117l8.39 4.195L21 9.834V12l-5 3v6l4.514-2.709a.998.998 0 0 0 .486-.857v-5.229l3-1.91v8.816l-8 5.07V21l-1 .645L14 21v3.182l-8-5.07v-8.817l3 1.91v5.229c0 .35.184.677.486.857L14 21v-6l-5-3V9.834L6.61 8.312 15 4.117ZM9 9.84l6 3.75 6-3.75-5.084-2.62a2 2 0 0 0-1.832 0L9 9.84Z"
                                                /></svg
                                            >
                                        </span>
                                    {/if}
                                    <span
                                        >{#if page.escape}{truncate(
                                                page.title
                                            )}{:else}{@html purifyHtml(
                                                truncate(page.title)
                                            )}{/if}</span
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
