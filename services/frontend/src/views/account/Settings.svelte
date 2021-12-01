<script>
    import { getContext, tick } from 'svelte';
    import flatten from 'lodash/flatten';

    import SettingsPageLayout from '_layout/SettingsPageLayout.svelte';
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';

    const request = getContext('request');

    export let __;
    export let settingsPages;

    const flatPages = flatten(settingsPages.map(d => d.pages));
    let curPage = flatPages.find(p => p.url === $request.path) || flatPages[0];

    async function loadPage(page) {
        if (page.svelte2) {
            $request.path = page.url;
            curPage = null;
            await tick();
            window.history.replaceState({}, '', page.url);
            curPage = page;
        } else {
            window.location.href = page.url;
        }
    }
</script>

<SettingsPageLayout {loadPage} {settingsPages} title="Account settings">
    <h2 class="title is-3" slot="header">
        {__('account / settings')}
    </h2>
    {#if curPage && curPage.svelte2}
        <h3 class="title is-3">{curPage.headline || curPage.title}</h3>
        <Svelte2Wrapper {...curPage.svelte2} data={curPage.data} />
    {/if}
</SettingsPageLayout>
