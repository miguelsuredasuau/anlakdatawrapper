<script>
    import { loadScript } from '@datawrapper/shared/fetch';
    import ChartEditorPreview from '_partials/editor/ChartEditorPreview.svelte';
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import { getContext, onMount } from 'svelte';
    import { headerProps } from '_layout/stores';
    // load stores from context
    const { chart, theme } = getContext('page/edit');

    const user = getContext('user');
    const userData = getContext('userData');
    const config = getContext('config');
    const events = getContext('events');

    export let dwChart;
    export let language;
    export let afterEmbed = [];
    export let guestAboveInvite;
    export let guestBelowInvite;
    export let embedTemplates;
    export let embedType;
    export let displayURLs;
    export let needsRepublish;

    /**
     * chart actions can be added by plugins
     */
    export let chartActions;

    let afterEmbedComponents = [];
    let iframePreview;

    $: svelteProps = {
        published: !!$chart.publishedAt,
        afterEmbed: afterEmbedComponents,
        guestAboveInvite,
        guestBelowInvite,
        embedTemplates,
        embedType,
        pluginShareurls: displayURLs,
        shareurlType: $userData.shareurl_type || 'default',
        needsRepublish
    };

    let innerHeight = 0;
    let innerWidth = 0;

    $: isSticky = innerHeight > 600 && innerWidth > 1200;

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

    async function onPublish(event) {
        events.dispatch('chart-publish', event.detail);
    }
</script>

<style>
    .preview.sticky {
        position: sticky;
        top: 20px;
    }
    .preview.sticky.sticky-header {
        top: 85px;
    }
</style>

<svelte:window bind:innerHeight bind:innerWidth />

<div class="container edit-publish-step">
    <div class="columns">
        <div class="column is-5 pt-0">
            <Svelte2Wrapper
                id="svelte/publish"
                js="/lib/static/js/svelte2/publish.js?sha={$config.GITHEAD}"
                css={[
                    `/lib/static/css/svelte2/publish.css?sha=${$config.GITHEAD}`,
                    ...afterEmbed.map(p => p.css)
                ]}
                bind:data={svelteProps}
                on:publish={onPublish}
                storeData={{
                    dw_chart: dwChart,
                    actions: chartActions,
                    language,
                    locales: $config.chartLocales.map(({ id, title }) => ({
                        value: id,
                        label: title
                    })),
                    theme: $theme,
                    /*
                     * we're passing this getter function instead of the iframePreview
                     * reference itself because at the time of setting this storeData
                     * props the bind:this={iframePreview} statement from below has
                     * not been evaluated yet
                     */
                    getIframePreview() {
                        return iframePreview;
                    },
                    // mimic old store values
                    user: {
                        isActivated: $user.isActivated,
                        isGuest: $user.isGuest
                    },
                    id: $chart.id,
                    lastEditStep: $chart.lastEditStep,
                    metadata: $chart.metadata,
                    publicUrl: $chart.publicUrl
                }}
            />
        </div>
        <div class="column is-7">
            <div
                class="preview"
                class:sticky={isSticky}
                class:sticky-header={$headerProps.isSticky}
            >
                <ChartEditorPreview bind:this={iframePreview} />
            </div>
        </div>
    </div>
</div>
