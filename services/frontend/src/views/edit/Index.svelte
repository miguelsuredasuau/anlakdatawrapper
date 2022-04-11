<script type="text/javascript">
    import { onMount, tick } from 'svelte';
    import truncate from '@datawrapper/shared/truncate';
    import MainLayout from '_layout/MainLayout.svelte';
    import ViewComponent from '_partials/ViewComponent.svelte';
    import Header from './nav/Header.svelte';
    import {
        data,
        chart,
        hasUnsavedChanges,
        initChartStore,
        initDataStore,
        onNextSave
    } from './stores';
    import delimited from '@datawrapper/chart-core/lib/dw/dataset/delimited.mjs';
    import dwChart from '@datawrapper/chart-core/lib/dw/chart.mjs';

    export let workflow;
    export let __;
    export let rawData; // the csv dataset
    export let rawChart; // the JSON chart object
    export let visualizations;
    export let initUrlStep;
    export let urlPrefix;

    /**
     * custom view components to be rendered
     */
    export let customViews = [];

    const dw_chart = dwChart(rawChart);
    dw_chart.save = dw_chart.saveSoon = () => {
        $chart = dw_chart.attributes();
    };
    dw_chart.dataset(
        delimited({
            csv: rawData
        }).parse()
    );
    dw_chart.onChange(() => {
        $chart = dw_chart.attributes();
    });
    /**
     * calls onNextSave
     * @param {function} method - pass
     */
    dw_chart.onNextSave = method => {
        if (typeof method === 'function') {
            onNextSave.add(method);
            // in case we didn't save (e.g. nothing has changed)
            // we remove this handler after 3 seconds
            setTimeout(() => {
                onNextSave.delete(method);
            }, 3000);
        }
    };

    // update dw_chart when our chart store changes
    chart.subscribe(() => {
        // we can update dw_chart here, but since the old UI
        // is not reactive to dw_chart changes, this won't
        // have any effect
        dw_chart.attributes($chart);
    });

    const steps = workflow.steps.map((step, i) => ({
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
        chart,
        data,
        visualizations,
        language: rawChart.language,
        chartData: rawData,
        dw_chart
    };

    $: chartTitle = $chart.title || rawChart.title;
    $: chartId = $chart.id || rawChart.id;

    $: lastActiveStep = $chart.lastEditStep || 1;

    onMount(async () => {
        initChartStore(rawChart);
        initDataStore(rawChart.id, rawData);
        if (!initUrlStep && rawChart.lastEditStep) {
            activeStep = steps[Math.max(1, Math.min(steps.length - 1, rawChart.lastEditStep - 1))];
        }
        navigateTo(activeStep, initUrlStep !== activeStep.id);
    });

    export let breadcrumbPath = [];

    $: truncatedBreadcrumbPath = (
        breadcrumbPath.length < 6
            ? breadcrumbPath
            : [...breadcrumbPath.slice(0, 3), { title: '...' }, ...breadcrumbPath.slice(-1)]
    ).map(folder => ({ ...folder, title: truncate(folder.title) }));

    async function navigateTo(step, pushState = true) {
        const stepUrl = `${urlPrefix}/${$chart.id}/${step.id}`;
        if ($chart.lastEditStep < step.index) {
            // update lastEditStep!
            $chart.lastEditStep = step.index;
        }
        if (stepUrl !== window.location.pathname && `/v2${stepUrl}` !== window.location.pathname) {
            if (step.event && (step.event.ctrlKey || step.event.metaKey || step.event.shiftKey)) {
                // open in new tab
                window.open(stepUrl, '_blank');
            } else {
                window.location.href = stepUrl;
            }
        }
        // TODO: bring back single-page navigation
        // activeStep = { title: activeStep.title || '', view: null };
        // await tick();
        // activeStep = step;
        // if (lastActiveStep && step.index > lastActiveStep) {
        //     $chart.lastEditStep = step.index;
        // }
        // if (pushState)
        //     window.history.pushState({ id: step.id }, '', `/v2/edit/${$chart.id}/${step.id}`);
    }

    function onPopState(event) {
        navigateTo(
            steps.find(s => s.id === event.state.id),
            false
        );
    }

    function onBeforeUnload(event) {
        if ($hasUnsavedChanges) {
            event.preventDefault();
            return (event.returnValue = __('edit / unsaved-changed-warning'));
        }
    }
</script>

<svelte:window
    on:popstate={onPopState}
    on:beforeunload={onBeforeUnload}
    on:pagehide={onBeforeUnload}
    on:unload={onBeforeUnload}
/>

<MainLayout title="{chartTitle} - [{chartId}] - {activeStep.title}">
    <section class="section pt-5">
        <!-- step nav -->
        <Header
            {__}
            prefix={workflow.prefix}
            {steps}
            breadcrumbPath={truncatedBreadcrumbPath}
            bind:activeStep
            bind:lastActiveStep
            on:navigate={evt => navigateTo(evt.detail)}
        />
        <!-- step content -->
        <div class="block">
            {#if activeStep && activeStep.view}
                <ViewComponent id={activeStep.view} props={stepProps} />
            {/if}
        </div>
    </section>

    {#if customViews && customViews.belowEditor && customViews.belowEditor.length > 0}
        {#each customViews.belowEditor as comp}
            <ViewComponent id={comp.id} props={{ ...comp.props, chart, activeStep, workflow }} />
        {/each}
    {/if}
</MainLayout>
