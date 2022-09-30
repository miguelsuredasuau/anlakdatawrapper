<script>
    import { fade } from 'svelte/transition';
    import { createEventDispatcher, getContext } from 'svelte';
    import BreadcrumbsDisplay from '_partials/displays/BreadcrumbsDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import Step from './Step.svelte';

    const user = getContext('user');
    const { hasUnsavedChanges, saveSuccess, saveError } = getContext('page/edit');
    const config = getContext('config');
    $: stickyHeaderThreshold = $config.stickyHeaderThreshold;
    const dispatch = createEventDispatcher();

    export let __;
    export let prefix;
    export let breadcrumbPath;
    export let steps;
    export let activeStep;
    export let lastActiveStep;
    export let dataReadonly;

    let innerHeight = 0;
    let innerWidth = 0;

    // d3-maps has some extra steps that it is hiding from the nav (for now)
    $: visibleSteps = steps.filter(step => !step.hide);
</script>

<style lang="scss">
    @import '../../../styles/export.scss';
    .is-sticky {
        position: sticky;
        top: 64px;
        z-index: 900;
        background: var(--color-dw-white-ter);
    }

    .is-status-column {
        line-height: 1.3;
    }
</style>

<svelte:window bind:innerHeight bind:innerWidth />

<div
    class="container block"
    class:is-sticky={false && innerHeight > stickyHeaderThreshold && innerWidth > 1200}
>
    <div class="columns is-1 is-variable">
        {#if !$user.isGuest}
            <div class="column is-narrow has-text-grey has-text-weight-medium">
                {__(`editor / chart-breadcrumb / ${prefix === 'edit' ? 'map' : prefix}`)}
                {__('editor / chart-breadcrumb / is-in-folder')}
            </div>
            <div class="column">
                <BreadcrumbsDisplay
                    path={breadcrumbPath}
                    className="has-text-grey has-text-weight-medium"
                />
            </div>
        {:else}
            <div class="column has-text-grey has-text-weight-medium">
                {@html __('edit / header / guest-welcome')}
            </div>
        {/if}
        {#if $saveError}
            <div class="column is-status-column is-4 has-text-danger">
                <IconDisplay icon="warning" size="1.2em" valign="sub" />
                {@html __('edit / storing-changes / error')}
            </div>
        {:else}
            <div class="column is-status-column is-narrow has-text-right has-text-grey is-size-7">
                {#if $hasUnsavedChanges}
                    <IconDisplay
                        valign="sub"
                        icon="loading-spinner"
                        timing="steps(12)"
                        duration="1s"
                        size="1.2em"
                        spin
                    />
                    {__('edit / storing-changes')}…
                {:else if $saveSuccess}
                    <span out:fade={{ delay: 0, duration: 500 }}>
                        <span>{__('edit / stored-changes')}</span>
                        <IconDisplay icon="checkmark-bold" />
                    </span>
                {/if}
            </div>
        {/if}
    </div>

    <div class="editor-step-nav">
        <div class="columns step-nav">
            {#each visibleSteps as step}
                <div class="column">
                    <Step
                        {step}
                        {lastActiveStep}
                        disabled={step.isDataStep && dataReadonly}
                        on:navigate={evt => dispatch('navigate', evt.detail)}
                        active={step.id === activeStep.id}
                    />
                </div>
            {/each}
        </div>
    </div>
</div>
