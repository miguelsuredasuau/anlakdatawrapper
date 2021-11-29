<script>
    import { getContext, tick } from 'svelte';
    import flatten from 'lodash/flatten';
    import truncate from '@datawrapper/shared/truncate';

    import SettingsPageLayout from '_layout/SettingsPageLayout.svelte';
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import httpReq from '@datawrapper/shared/httpReq';
    import debounce from 'lodash/debounce';

    const request = getContext('request');

    export let __;
    export let team;
    export let settingsPages;
    export let storeData;

    const flatPages = flatten(settingsPages.map(d => d.pages));
    let curPage = flatPages.find(p => p.url === $request.path) || flatPages[0];
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

    const storeTeamSettings = debounce(async function (event) {
        const { team: eventTeam, settings, defaultTheme } = event.detail;
        await httpReq.patch(`/v3/teams/${team.id}`, {
            payload: {
                name: eventTeam.name,
                ...(settings ? { settings } : {}),
                ...(defaultTheme ? { defaultTheme } : {})
            }
        });
        team.name = eventTeam.name;
        team.settings = settings;
        team.defaultTheme = defaultTheme;
    }, 1000);
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
            on:change={storeTeamSettings}
            data={{ ...curPage.data, team, settings: team.settings }}
        />
    {/if}
    <div slot="belowNav">
        <hr />
        <ul>
            <li>
                <a href="/account/teams"
                    ><IconDisplay icon="arrow-left" size="20px" valign="-0.25em" /> My Teams</a
                >
            </li>
            <li>
                <a href="/archive/team/{team.id}"
                    ><IconDisplay icon="arrow-left" size="20px" valign="-0.25em" /> Teams charts</a
                >
            </li>
        </ul>
    </div>
</SettingsPageLayout>
