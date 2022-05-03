<script>
    import { loadScript } from '@datawrapper/shared/fetch';
    import ChartPreviewIframeDisplay from '_partials/displays/ChartPreviewIframeDisplay.svelte';
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import { getContext, onMount } from 'svelte';
    import { chart } from '../stores';

    const user = getContext('user');
    const config = getContext('config');

    export let dw_chart;
    export let language;
    export let theme;
    export let afterEmbed;
    export let guestAboveInvite;
    export let guestBelowInvite;

    let afterEmbedComponents = [];

    $: data = {
        published: !!$chart.publishedAt,
        afterEmbed: afterEmbedComponents,
        guestAboveInvite,
        guestBelowInvite
    };

    $: embedWidth = 500;
    $: embedHeight = 300;
    $: chartUrlLocal = '';

    onMount(async () => {
        // load afterEmbed components
        afterEmbedComponents = await Promise.all(
            afterEmbed.map(props => {
                return new Promise(resolve => {
                    loadScript(props.js).then(() => {
                        require([props.module], mod => {
                            resolve({ app: mod.App, data: props.data });
                        });
                    });
                });
            })
        );
    });
</script>

<div class="container">
    <div class="columns">
        <div class="column is-5 pt-0">
            <Svelte2Wrapper
                id="svelte/publish"
                js="/lib/static/js/svelte2/publish.js?sha={$config.GITHEAD}"
                css={[
                    `/lib/static/css/svelte2/publish.css?sha=${$config.GITHEAD}`,
                    ...afterEmbed.map(p => p.css)
                ]}
                bind:data
                storeData={{
                    dw_chart,
                    actions: [],
                    language,
                    locales: $config.chartLocales.map(({ id, title }) => ({
                        value: id,
                        label: title
                    })),
                    // mimic old store values
                    user: {
                        isActivated: $user.isActivated,
                        isGuest: $user.isGuest
                    },
                    id: $chart.id,
                    lastEditStep: $chart.lastEditStep
                }}
            />
        </div>
        <div class="column is-7">
            <ChartPreviewIframeDisplay {chart} {theme} />
        </div>
    </div>
</div>
