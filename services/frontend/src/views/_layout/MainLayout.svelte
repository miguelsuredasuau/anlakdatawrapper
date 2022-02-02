<script>
    import PageHeader from './PageHeader.svelte';
    import PageFooter from './PageFooter.svelte';
    import OutdatedBrowserDisplay from '_partials/displays/OutdatedBrowserDisplay.svelte';

    export let title;
</script>

<style>
    @media (min-height: 800px) {
        :global(html) {
            scroll-padding-top: 80px !important;
        }
    }
</style>

<svelte:head>
    <title>{title ? `${title} - ` : ''}Datawrapper</title>
</svelte:head>

<OutdatedBrowserDisplay />

<PageHeader />

<slot />

<PageFooter />
