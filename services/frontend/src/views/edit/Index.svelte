<script type="text/javascript">
    import { getContext, onDestroy, onMount, setContext, tick } from 'svelte';
    import truncate from '@datawrapper/shared/truncate.js';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import MainLayout from '_layout/MainLayout.svelte';
    import { openedInsideIframe } from '_layout/stores';
    import ViewComponent from '_partials/ViewComponent.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import Header from './nav/Header.svelte';
    import { initStores } from './stores';
    import ChartCoreChart from '@datawrapper/chart-core/lib/dw/chart.mjs';
    import escapeHtml from '@datawrapper/shared/escapeHtml.js';
    import httpReq from '@datawrapper/shared/httpReq.js';
    import dw from '@datawrapper/chart-core/lib/dw/index.mjs';
    import { trackPageView } from '@datawrapper/shared/analytics.js';
    import merge from 'lodash/merge';
    import cloneDeep from 'lodash/cloneDeep';
    import { SubscriptionCollection } from '../../utils/rxjs-store.mjs';
    import { distinctUntilChanged, filter } from 'rxjs/operators';
    import { getChartEditorPath } from '../../utils/chart-editor-path.mjs';

    export let workflow;
    export let __;
    export let rawData; // the csv dataset
    export let rawChart; // the JSON chart object
    export let rawTeam; // the JSON team object
    export let rawLocales;
    export let rawVendorLocales;
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
    const request = getContext('request');

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
    export let rawReadonlyKeys = [];

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
    const {
        chart,
        theme,
        tableDataset,
        dataset,
        onNextSave,
        hasUnsavedChanges,
        data,
        syncData,
        syncExternalData,
        syncExternalMetadata,
        syncChart,
        team,
        readonlyKeys,
        activeStepId,
        ...stores
    } = initStores({
        rawChart,
        rawData,
        rawTeam,
        rawTheme,
        rawLocales,
        rawVendorLocales,
        rawVisualizations: visualizations,
        rawReadonlyKeys,
        dataReadonly
    });
    setContext('page/edit', {
        chart,
        customViews,
        data,
        tableDataset,
        dataset,
        hasUnsavedChanges,
        onNextSave,
        theme,
        navigateTo,
        team,
        readonlyKeys,
        activeStepId,
        onEditorStepChange,
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
                onNextSave(method);
            } else {
                // call immediately
                method();
            }
        }
    };

    dwChart.observeDeep = (key, handler) => {
        storeSubscriptions.add(chart.observeKey(key, handler));
    };

    dwChart.serialize = () => {
        return cloneDeep($chart);
    };

    dwChart.isPassive = () => false;

    // update dwChart when our chart store changes
    // we can update dwChart here, but since the old UI
    // is not reactive to dwChart changes, this won't
    // have any effect
    $: dwChart.attributes($chart);
    $: dwChart.setDataset($dataset);

    const baseProps = {
        workflow,
        visualizations,
        language: rawChart.language,
        dwChart,
        dataReadonly,
        readonlyKeys: $readonlyKeys,
        __
    };

    const steps = workflow.steps.map(step => ({
        ...step,
        title: __(step.title[0], step.title[1]),
        props: {
            ...step.data,
            ...baseProps
        }
    }));

    // d3-maps has some extra steps that it is hiding from the nav (for now)
    steps
        .filter(step => !step.hide)
        .forEach((step, i) => {
            step.index = i + 1;
        });

    let activeStep = steps.find(s => s.id === initUrlStep) || steps[0];

    $: lastActiveStep = $chart.lastEditStep || 1;

    $: author = $chart.author
        ? $chart.author.email || `"${$chart.author.name}" (#${$chart.authorId})`
        : null;

    /*
     * keep track of store subscriptions so we can unsubscribe when this component gets destroyed
     */
    const storeSubscriptions = new SubscriptionCollection();

    // mimic old dw setup
    /* SSR_IGNORE_START */
    window.dw = merge(window.dw, dw, {
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
    });
    /* SSR_IGNORE_END */

    onMount(async () => {
        /*
         * Start the syncing of chart and data with the server.
         *
         * Notice that we don't prefix the store variables with `$` but instead call `subscribe()`
         * manually. The reason is that if we use the `$` prefix, then Svelte always subscribes to
         * the stores during server-side rendering, even though this code is inside `onMount()`.
         * This causes the app to try to PATCH a chart during server-side rendering, which throws an
         * exception in httpReq: "Neither options.fetch nor window.fetch is defined".
         */
        storeSubscriptions.add(syncData.subscribe());
        storeSubscriptions.add(syncExternalData.subscribe());
        storeSubscriptions.add(syncExternalMetadata.subscribe());
        storeSubscriptions.add(syncChart.subscribe());

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

    onDestroy(() => {
        storeSubscriptions.unsubscribe();
    });

    export let breadcrumbPath = [];

    $: truncatedBreadcrumbPath = (
        breadcrumbPath.length < 6
            ? breadcrumbPath
            : [...breadcrumbPath.slice(0, 3), { title: '...' }, ...breadcrumbPath.slice(-1)]
    ).map(folder => ({ ...folder, title: truncate(escapeHtml(folder.title)) }));

    /**
     * remember which tabs we've opened already to keep them
     * in DOM, but without having to load them all at once
     */
    // TODO: remove forced pre-loading of upload step once it
    // has been rewritten in Svelte 3 and no longer relies on
    // injected script tags
    let stepLoaded = { upload: true };
    $: {
        if (activeStep) {
            stepLoaded = { ...stepLoaded, [activeStep.id]: true };
            if (activeStep.id) $activeStepId = activeStep.id;
        }
    }

    function onEditorStepChange(step, callback) {
        return activeStepId
            .pipe(
                distinctUntilChanged(),
                filter(stepId => stepId === step)
            )
            .subscribe(callback);
    }

    async function navigateTo(step) {
        const stepUrl = `${urlPrefix}/${$chart.id}/${step.id}`;
        if (stepUrl !== window.location.pathname) {
            if (step.event && (step.event.ctrlKey || step.event.metaKey || step.event.shiftKey)) {
                // open in new tab
                window.open(stepUrl, '_blank');
                return;
            }
        }
        if (step.forceReload && !urlPrefix.startsWith('/v2/')) {
            window.location.href = stepUrl;
            return;
        }
        activeStep = { title: activeStep.title || '', view: null };
        await tick();
        activeStep = step;
        if (lastActiveStep && step.index > lastActiveStep) {
            $chart.lastEditStep = step.index;
        }
        if (typeof window !== 'undefined') {
            const newPath = `${urlPrefix}/${$chart.id}/${step.id}`;
            if ($request.path !== newPath) {
                // only puth new history state if the path has changed to
                // preseve initial URL hashes such as #refine
                $request.path = newPath;
                window.history.pushState({ id: step.id }, '', newPath);
                trackPageView($user.isGuest ? 'guest' : $user.id, $team.id);
            }
        }
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
        const editorPath = getChartEditorPath(chart.type);
        window.location.href = `/${editorPath}/${res.id}/edit`;
    }
</script>

<svelte:window
    on:popstate={onPopState}
    on:beforeunload={onBeforeUnload}
    on:pagehide={onBeforeUnload}
    on:unload={onBeforeUnload}
/>

<MainLayout title="{purifyHtml($chart.title, [])} - [{$chart.id}] - {activeStep.title}">
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
        <ViewComponent
            id={workflow.baseView || 'edit/base'}
            props={{ ...baseProps, step: activeStep.id }}
            {__}
        >
            {#each steps as step}
                {#if step.view && stepLoaded[step.id]}
                    <div class:is-sr-only={step.id !== activeStep.id}>
                        <ViewComponent id={step.view} props={step.props} {__} />
                    </div>
                {/if}
            {/each}
        </ViewComponent>
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
