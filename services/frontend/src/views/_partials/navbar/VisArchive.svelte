<script>
    import { onMount, getContext } from 'svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import httpReq from '@datawrapper/shared/httpReq.js';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import truncate from '@datawrapper/shared/truncate.js';
    import NavBarIcon from './NavBarIcon.svelte';

    const request = getContext('request');

    let items = undefined;
    export let link;
    export let __;

    onMount(async () => {
        // load recently edited visualizations
        const { list: charts } = await httpReq.get('/v3/me/recently-edited-charts?limit=10');
        items = charts;
    });

    $: title = __('archive');
    const url = '/archive/recently-edited';
</script>

<style lang="scss">
    .just-arrow .navbar-link:not(.is-arrowless)::after {
        right: unset;
        top: unset;
        position: relative;
    }
    .navbar-dropdown {
        width: 300px;
    }

    img {
        vertical-align: baseline;
        position: relative;
        top: 2px;
        max-height: auto;
    }
    .vis-archive-item {
        display: block;
        font-weight: normal;
        white-space: normal;
        line-height: 1.3;
        padding-right: 1rem;
    }

    .column {
        // padding-top: 2px;
        // padding-bottom: 2px;

        &:last-of-type {
            display: flex;
            align-items: center;
        }
    }
</style>

<a
    class:is-active={url === '/' ? $request.path === '/' : $request.path.startsWith(url)}
    class="navbar-item is-size-5 has-text-weight-medium ml-1"
    href={url}><NavBarIcon item={{ svgIcon: 'cabinet', title: true }} /> <span>{title}</span></a
>
<div
    class="navbar-item has-dropdown is-hoverable is-size-5 has-text-weight-medium is-hidden-touch"
    class:just-arrow={link.type === 'visArchive' && !link.title && !link.icon && !link.svgIcon}
>
    <a
        href={link.url || '#/dropdown'}
        on:click|preventDefault
        class="navbar-link px-2 mr-2"
        style={link.style || ''}
        class:is-arrowless={link.type !== 'visArchive'}
    >
        <NavBarIcon item={link} />
        <span class="navbar-title">{@html purifyHtml(link.title || '')}</span></a
    >

    <div class="navbar-dropdown is-right is-boxed">
        {#if !items}
            <div class=" navbar-item has-text-grey is-size-7 has-text-centered">
                <IconDisplay
                    valign="middle"
                    icon="loading-spinner"
                    timing="steps(12)"
                    duration="1s"
                    className="mr-2 is-size-6 has-text-grey"
                    spin
                />
                {__('navbar / vis-archive / loading')}
            </div>
        {:else if !items.length}
            <div class=" navbar-item has-text-grey is-size-7 has-text-centered">
                {__('navbar / vis-archive / no-visualizations')}
            </div>
        {:else}
            {#each items as item}
                <a class="navbar-item vis-archive-item is-size-6" href="/chart/{item.id}/edit">
                    <div class="columns is-variable is-0">
                        <div class="column is-narrow">
                            <img width="40" src={item.thumbnails.plain} alt="" class="mr-2" />
                        </div>
                        <div class="column">
                            {truncate(purifyHtml(item.title, []), 30, 20)}
                        </div>
                    </div>
                </a>
            {/each}
        {/if}
    </div>
</div>
