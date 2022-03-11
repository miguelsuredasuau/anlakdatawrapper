<script>
    import { getContext, tick } from 'svelte';
    import flatten from 'lodash/flatten';

    import SettingsPageLayout from '_layout/SettingsPageLayout.svelte';
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import ViewComponent from '_partials/ViewComponent.svelte';

    const request = getContext('request');

    export let __;
    export let settingsPages;

    const flatPages = flatten(settingsPages.map(d => d.pages));

    let curPage =
        flatPages.find(p =>
            p.url
                ? p.url === $request.path
                : p.pathRegex
                ? new RegExp(p.pathRegex).test($request.path)
                : false
        ) || flatPages[0];

    async function loadPage(page) {
        if (page.svelte2 || page.view) {
            $request.path = page.url;
            curPage = null;
            await tick();
            curPage = page;
            window.history.replaceState({}, '', page.url);
        } else {
            window.location.href = page.url;
        }
    }
</script>

<SettingsPageLayout {loadPage} {settingsPages} title={curPage ? curPage.title : 'Admin Pages'}>
    <h2 class="title is-2" slot="header">Admin Pages</h2>
    {#if curPage && curPage.svelte2}
        <h3 class="title is-3">{curPage.headline || curPage.title}</h3>
        <Svelte2Wrapper {...curPage.svelte2} data={curPage.data} />
    {/if}
    {#if curPage && curPage.view}
        <h3 class="title is-3">{curPage.headline || curPage.title}</h3>
        <ViewComponent id={curPage.view} {__} props={curPage.data} />
    {/if}
</SettingsPageLayout>
