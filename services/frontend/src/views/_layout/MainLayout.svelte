<script>
    import PageHeader from './PageHeader.svelte';
    import PageFooter from './PageFooter.svelte';
    import OutdatedBrowserDisplay from '_partials/displays/OutdatedBrowserDisplay.svelte';
    import { onMount, getContext } from 'svelte';
    import { openedInsideIframe } from './stores';
    export let title;

    const userData = getContext('userData');

    /*
     * when Datawrapper is opened inside an iframe we're hiding
     * the page header and footer to support our CMS integrations
     */
    onMount(() => {
        $openedInsideIframe = window.top !== window.self;
        // expose convenience method for changing the userData store
        window.__setUserData = (key, value) => {
            $userData[key] = value;
        };
    });
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

{#if !$openedInsideIframe}
    <PageHeader />
{/if}

<slot />

{#if !$openedInsideIframe}
    <PageFooter />
{/if}
