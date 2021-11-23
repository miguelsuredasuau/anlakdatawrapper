<script>
    import { getContext, tick } from 'svelte';
    import flatten from 'lodash/flatten';
    import truncate from '@datawrapper/shared/truncate';

    import SettingsPageLayout from '_layout/SettingsPageLayout.svelte';
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';

    const request = getContext('request');

    export let __;
    export let team;
    export let pageId;
    export let settingsPages;
    export let storeData;

    const flatPages = flatten(settingsPages.map(d => d.pages));
    let curPage = flatPages.find(p => p.id === pageId) || flatPages[0];

    $: titleParts = [
        truncate(team.name, 17, 8),
        __('nav / team / settings'),
        ...(curPage ? [curPage.title] : [])
    ];
    $: title = titleParts.join(' » ');

    async function loadPage(page) {
        $request.path = page.url;
        curPage = null;
        await tick();
        window.history.replaceState({}, '', page.url);
        curPage = page;
    }
</script>

<SettingsPageLayout {loadPage} {settingsPages} {title}>
    <h2 class="title is-2" slot="header">
        {titleParts[0]} » {titleParts[1]}
    </h2>
    {#if curPage && curPage.svelte2}
        <h3 class="title is-3">{curPage.headline || curPage.title}</h3>
        <Svelte2Wrapper
            {...curPage.svelte2}
            {storeData}
            data={{ ...curPage.data, settings: team.settings }}
        />
    {/if}
    <div slot="belowNav">
        <hr />
        <ul>
            <li><a href="/account/teams">My Teams</a></li>
            <li><a href="/archive/team/{team.id}">Teams charts</a></li>
        </ul>
    </div>
</SettingsPageLayout>
