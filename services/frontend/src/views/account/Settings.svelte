<script>
    import { getContext, tick } from 'svelte';

    import SettingsPageLayout from '_layout/SettingsPageLayout.svelte';
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';

    const request = getContext('request');

    export let settingsPages;

    let curPage = settingsPages[0].pages[0];

    async function loadPage(page) {
        $request.path = page.url;
        curPage = null;
        await tick();
        window.history.replaceState({}, '', page.url);
        curPage = page;
    }
</script>

<SettingsPageLayout {loadPage} {settingsPages} title="Account settings">
    {#if curPage && curPage.svelte2}
        <Svelte2Wrapper {...curPage.svelte2} data={curPage.data} />
    {/if}
</SettingsPageLayout>
