<script>
    import { getContext, tick } from 'svelte';
    import flatten from 'lodash/flatten';
    import truncate from '@datawrapper/shared/truncate.js';

    import SettingsPageLayout from '_layout/SettingsPageLayout.svelte';
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import ViewComponent from '_partials/ViewComponent.svelte';
    import httpReq from '@datawrapper/shared/httpReq.js';
    import cloneDeep from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';
    import isEqual from 'lodash/isEqual';
    import { trackPageView } from '@datawrapper/shared/analytics.js';

    const request = getContext('request');
    const user = getContext('user');

    export let __;
    export let folders;
    export let locales;
    export let settingsPages;
    export let storeData;
    export let team;
    export let themes;

    const flatPages = flatten(settingsPages.map(d => d.pages));
    let curPage = flatPages.find(p => p.url === $request.path) || flatPages[0];
    $: titleParts = [
        truncate(team.name, 17, 8),
        __('nav / team / settings'),
        ...(curPage ? [curPage.title] : [])
    ];
    $: title = titleParts.join(' › ');

    async function loadPage(page) {
        $request.path = page.url;
        curPage = null;
        await tick();
        window.history.replaceState({}, '', page.url);
        trackPageView($user.id, team.id);
        curPage = page;
    }

    const storeTeamSettings = debounce(async function ({ detail }) {
        const { team: _team, settings } = detail;
        const changed = {
            name: _team.name && team.name !== _team.name,
            settings: settings && !isEqual(team.settings, settings),
            defaultTheme: _team.default_theme && team.default_theme !== _team.default_theme
        };
        if (changed.name || changed.settings || changed.defaultTheme) {
            await httpReq.put(`/v3/teams/${team.id}`, {
                payload: {
                    name: _team.name,
                    defaultTheme: _team.default_theme,
                    settings
                }
            });
        }
        if (changed.name) {
            team.name = _team.name;
        }
        if (changed.settings) {
            team.settings = cloneDeep(settings);
        }
        if (changed.defaultTheme) {
            team.default_theme = _team.default_theme;
        }
    }, 1000);
</script>

<SettingsPageLayout {loadPage} {settingsPages} {title}>
    <h2 class="title is-3" slot="header">
        <span class="has-text-weight-light">{titleParts[0]}</span>
        <span class="has-text-grey px-3">›</span>
        {titleParts[1]}
    </h2>
    {#if curPage && curPage.svelte2}
        <h3 class="title is-3">{curPage.headline || curPage.title}</h3>
        <Svelte2Wrapper
            {...curPage.svelte2}
            {storeData}
            on:change={storeTeamSettings}
            data={{
                ...curPage.data,
                folders,
                locales,
                team,
                themes,
                settings: team.settings,
                isAdmin: $user.isAdmin
            }}
        />
        {#each curPage.sections as section}
            <Svelte2Wrapper
                {...section.svelte2}
                {storeData}
                on:change={storeTeamSettings}
                data={{
                    ...section.data,
                    folders,
                    locales,
                    team,
                    themes,
                    settings: team.settings,
                    isAdmin: $user.isAdmin
                }}
            />
        {/each}
    {/if}
    {#if curPage && curPage.view}
        <h3 class="title is-3">{curPage.headline || curPage.title}</h3>
        <ViewComponent
            id={curPage.view}
            {__}
            on:change={storeTeamSettings}
            props={{
                ...curPage.data,
                team,
                settings: team.settings
            }}
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
