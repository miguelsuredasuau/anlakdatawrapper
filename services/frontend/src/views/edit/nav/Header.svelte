<script>
    import { createEventDispatcher, getContext } from 'svelte';
    import BreadcrumbsDisplay from '_partials/displays/BreadcrumbsDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import Step from './Step.svelte';
    import { hasUnsavedChanges, saveError } from '../stores';

    const config = getContext('config');
    $: stickyHeaderThreshold = $config.stickyHeaderThreshold;
    const dispatch = createEventDispatcher();

    export let __;
    export let prefix;
    export let breadcrumbPath;
    export let steps;
    export let activeStep;
    export let lastActiveStep;

    let innerHeight = 0;
    let innerWidth = 0;
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

    @include desktop {
        .is-status-column {
            max-width: 28em;
        }
    }
</style>

<svelte:window bind:innerHeight bind:innerWidth />

<div
    class="container block"
    class:is-sticky={false && innerHeight > stickyHeaderThreshold && innerWidth > 1200}
>
    <div class="columns is-1 is-variable">
        <div class="column is-narrow has-text-grey has-text-weight-medium">
            {__(`editor / chart-breadcrumb / ${prefix === 'edit' ? 'map' : prefix}`)}
            {__('editor / chart-breadcrumb / is-in-folder')}
        </div>
        <div class="column is-flex-grow-2">
            <BreadcrumbsDisplay
                path={breadcrumbPath}
                className="has-text-grey has-text-weight-medium"
            />
        </div>
        <div
            class="column is-size-7 has-text-grey has-text-right is-status-column is-flex is-align-items-center is-justify-content-flex-end"
        >
            {#if $saveError}
                <span class="has-text-danger"
                    ><IconDisplay icon="warning" size="1.2em" valign="sub" />
                    {@html __('edit / storing-changes / error')}</span
                >
            {:else if $hasUnsavedChanges}
                <span
                    ><IconDisplay
                        valign="sub"
                        icon="loading-spinner"
                        timing="steps(12)"
                        duration="1s"
                        size="1.2em"
                        spin
                    />
                    {__('edit / storing-changes')}…</span
                >
            {/if}
        </div>
    </div>

    <div class="editor-step-nav">
        <div class="columns step-nav">
            {#each steps as step}
                <div class="column">
                    <Step
                        {step}
                        {lastActiveStep}
                        on:navigate={evt => dispatch('navigate', evt.detail)}
                        active={step === activeStep}
                    />
                </div>
            {/each}
        </div>
    </div>
</div>
