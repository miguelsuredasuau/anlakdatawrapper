<script type="text/javascript">
    import { getContext, onMount, setContext } from 'svelte';
    import truncate from '@datawrapper/shared/truncate';
    import MainLayout from '_layout/MainLayout.svelte';
    import { openedInsideIframe } from '_layout/stores';
    import ViewComponent from '_partials/ViewComponent.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import Header from './nav/Header.svelte';
    import { initStores } from './stores';
    import ChartCoreChart from '@datawrapper/chart-core/lib/dw/chart.mjs';
    import escapeHtml from '@datawrapper/shared/escapeHtml.cjs';
    import httpReq from '@datawrapper/shared/httpReq';
    import dw from '@datawrapper/chart-core/dist/dw-2.0.cjs';

    export let workflow;
    export let __;
    export let rawData; // the csv dataset
    export let rawChart; // the JSON chart object
    export let rawTeam; // the JSON team object
    export let rawLocales;
    export let visualizations;
    export let initUrlStep;
    export let urlPrefix;
    export let rawTheme;

    /**
     * custom view components to be rendered on various
     * places throughout the editor
     */
    export let customViews = {};

    const messages = getContext('messages');
    const config = getContext('config');
    const user = getContext('user');
    const userData = getContext('userData');

    /*
     * if set to true, the editor nav is shown even if the app is opened
     * inside an iframe as part of a CMS integration. This setting comes
     * from the current users active team.
     */
    export let showEditorNavInCmsMode = false;

    /**
     * charts can define an external source for
     * overwriting metadata. the corresponding ui elements
     * will be shown as disabled in the editor
     */
    export let disabledFields = [];

    /**
     * admins may edit charts they otherwise don't have access
     * to, but we'll show them a warning
     */
    export let showAdminWarning = false;

    /**
     * in certain cases, the data of a visualization is protected
     * and can not be edited by the user
     */
    export let dataReadonly = false;

    /*
     * we're using a "page context" here to be able to make
     * our store instances available to all sub components of this
     * view without having to pass them around as state props.
     */
    const { chart, theme, dataset, onNextSave, hasUnsavedChanges, syncData, syncChart, ...stores } =
        initStores({
            rawChart,
            rawData,
            rawTeam,
            rawTheme,
            rawLocales,
            rawVisualizations: visualizations,
            disabledFields,
            dataReadonly
        });
    setContext('page/edit', {
        chart,
        customViews,
        dataset,
        hasUnsavedChanges,
        onNextSave,
        theme,
        ...stores
    });

    const dwChart = ChartCoreChart(rawChart);
    dwChart.save = dwChart.saveSoon = () => {
        $chart = dwChart.attributes();
    };
    dwChart.onChange(() => {
        $chart = dwChart.attributes();
    });
    /**
     * calls onNextSave
     * @param {function} method - pass
     */
    dwChart.onNextSave = method => {
        if (typeof method === 'function') {
            if ($hasUnsavedChanges) {
                onNextSave.add(method);
                // in case we didn't save (e.g. nothing has changed)
                // we remove this handler after 3 seconds
                setTimeout(() => {
                    onNextSave.delete(method);
                }, 3000);
            } else {
                // call immediately
                method();
            }
        }
    };

    // update dwChart when our chart store changes
    // we can update dwChart here, but since the old UI
    // is not reactive to dwChart changes, this won't
    // have any effect
    $: dwChart.attributes($chart);
    $: dwChart.dataset($dataset);

    const steps = workflow.steps.map(step => ({
        ...step,
        title: __(step.title[0], step.title[1])
    }));

    // d3-maps has some extra steps that it is hiding from the nav (for now)
    steps
        .filter(step => !step.hide)
        .forEach((step, i) => {
            step.index = i + 1;
        });

    let activeStep = steps.find(s => s.id === initUrlStep) || steps[0];

    $: stepProps = {
        ...activeStep.data,
        workflow,
        visualizations,
        language: rawChart.language,
        chartData: rawData,
        dwChart,
        dataReadonly,
        disabledFields: new Set(disabledFields),
        __
    };

    $: lastActiveStep = $chart.lastEditStep || 1;

    $: author = $chart.author
        ? $chart.author.email || `"${$chart.author.name}" (#${$chart.authorId})`
        : null;

    // Following two lines start the syncing of chart and data with the server.
    // Svelte takes care of subscribing and unsubscribing automatically.
    $syncData;
    $syncChart;

    onMount(async () => {
        // mimic old dw setup
        window.dw = {
            ...dw,
            backend: {
                __messages: $messages,
                __api_domain: $config.apiDomain,
                __userData: $userData,
                hooks:
                    window && window.dw && window.dw.backend && window.dw.backend.hooks
                        ? window.dw.backend.hooks
                        : initHooks()
            }
        };

        if (!initUrlStep && rawChart.lastEditStep) {
            activeStep = steps[Math.max(1, Math.min(steps.length - 1, rawChart.lastEditStep - 1))];
        }
        navigateTo(activeStep, initUrlStep !== activeStep.id);

        if ($user.isAdmin) {
            window.__chart = {
                ...dwChart,
                subscribe: chart.subscribeKey
            };
        }
    });

    export let breadcrumbPath = [];

    $: truncatedBreadcrumbPath = (
        breadcrumbPath.length < 6
            ? breadcrumbPath
            : [...breadcrumbPath.slice(0, 3), { title: '...' }, ...breadcrumbPath.slice(-1)]
    ).map(folder => ({ ...folder, title: truncate(escapeHtml(folder.title)) }));

    async function navigateTo(step) {
        const stepUrl = `${urlPrefix}/${$chart.id}/${step.id}`;
        if (stepUrl !== window.location.pathname && `/v2${stepUrl}` !== window.location.pathname) {
            if (step.event && (step.event.ctrlKey || step.event.metaKey || step.event.shiftKey)) {
                // open in new tab
                window.open(stepUrl, '_blank');
            } else {
                window.location.href = stepUrl;
            }
        }
        // TODO: bring back single-page navigation (and remove lastEditStep incrementation logic from edit route)
        // activeStep = { title: activeStep.title || '', view: null };
        // await tick();
        // activeStep = step;
        // if (lastActiveStep && step.index > lastActiveStep) {
        //     $chart.lastEditStep = step.index;
        // }
        // if (pushState)
        //     window.history.pushState({ id: step.id }, '', `/v2/edit/${$chart.id}/${step.id}`);
    }

    function initHooks() {
        const hooks = new Map();
        return {
            register(key, method) {
                if (!hooks.has(key)) hooks.set(key, new Set());
                hooks.get(key).add(method);
            },
            unregister(key) {
                hooks.delete(key);
            },
            call(key) {
                const results = [];
                if (hooks.has(key)) {
                    for (const method of hooks.get(key)) {
                        results.push(method());
                    }
                }
                return { results };
            }
        };
    }

    function onPopState(event) {
        if (event.state && event.state.id) {
            navigateTo(
                steps.find(s => s.id === event.state.id),
                false
            );
        }
    }

    function onBeforeUnload(event) {
        if ($hasUnsavedChanges) {
            event.preventDefault();
            return (event.returnValue = __('edit / unsaved-changed-warning'));
        }
    }

    async function duplicateChart() {
        const res = await httpReq.post(`/v3/charts/${$chart.id}/copy`);
        // redirect to copied chart
        window.location.href = `/chart/${res.id}/edit`;
    }
</script>

<svelte:window
    on:popstate={onPopState}
    on:beforeunload={onBeforeUnload}
    on:pagehide={onBeforeUnload}
    on:unload={onBeforeUnload}
/>

<MainLayout title="{$chart.title} - [{$chart.id}] - {activeStep.title}">
    <section class="section pt-5">
        {#if !$openedInsideIframe || showEditorNavInCmsMode}
            <!-- step nav -->
            <Header
                {__}
                prefix={workflow.prefix}
                {steps}
                {dataReadonly}
                breadcrumbPath={truncatedBreadcrumbPath}
                bind:activeStep
                bind:lastActiveStep
                on:navigate={evt => navigateTo(evt.detail)}
            />
        {/if}
        {#if showAdminWarning}<div class="block container">
                <MessageDisplay type="warning"
                    >This chart belongs to <b
                        ><a href="/admin/chart/by/user/{$chart.authorId}">{author}</a></b
                    >. With great power comes with great responsibility, so be careful with what
                    you're doing! Also consider these options before editing this chart:
                    <div class="buttons are-small mt-2">
                        <button class="button" on:click={duplicateChart}
                            >Copy to your account</button
                        >
                        <a
                            class="button"
                            href="http://app.datawrapper.local/admin/copy-to-local?chartIds={$chart.id}"
                            >Copy to your local instance</a
                        >
                    </div>
                </MessageDisplay>
            </div>{/if}
        <!-- step content -->
        {#if activeStep && activeStep.view}
            <ViewComponent id={activeStep.view} props={stepProps} {__} />
        {/if}
    </section>

    {#if customViews && customViews.belowEditor && customViews.belowEditor.length > 0}
        {#each customViews.belowEditor as comp}
            <ViewComponent
                id={comp.id}
                props={{ ...comp.props, chart, activeStep, workflow, theme }}
            />
        {/each}
    {/if}
</MainLayout>
