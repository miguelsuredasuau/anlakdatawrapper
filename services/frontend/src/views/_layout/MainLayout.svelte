<script>
    import PageHeader from './PageHeader.svelte';
    import PageFooter from './PageFooter.svelte';
    import OutdatedBrowserDisplay from '_partials/displays/OutdatedBrowserDisplay.svelte';
    import ConfirmationModalDisplay from '_partials/displays/ConfirmationModalDisplay.svelte';
    import { onMount, getContext, setContext } from 'svelte';
    import { openedInsideIframe } from './stores';
    import { waitFor } from '../../utils';
    export let title;

    const userData = getContext('userData');

    setContext('layout/main', {
        /**
         * displays a confirmation modal
         * @returns {boolean} - true if "yes" was selected, otherwise false
         */
        async showConfirmationModal(modalOptions) {
            confirmationModalResult = 'pending';
            confirmationModal = modalOptions;
            await waitFor(() => confirmationModalResult !== 'pending');
            const confirmed = confirmationModalResult === 'confirm';
            confirmationModalResult = confirmationModal = null;
            return confirmed;
        }
    });

    let confirmationModal;
    let confirmationModalResult;

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

{#if confirmationModal}
    <ConfirmationModalDisplay
        {...confirmationModal}
        on:cancel={() => (confirmationModalResult = 'cancel')}
        on:confirm={() => (confirmationModalResult = 'confirm')}
    />
{/if}

<OutdatedBrowserDisplay />

{#if !$openedInsideIframe}
    <PageHeader />
{/if}

<slot />

{#if !$openedInsideIframe}
    <PageFooter />
{/if}
