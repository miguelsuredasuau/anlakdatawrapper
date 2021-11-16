<script>
    import PageHeader from './PageHeader.svelte';
    import PageFooter from './PageFooter.svelte';

    export let title;
</script>

<svelte:head>
    <title>{title ? `${title} - ` : ''}Datawrapper</title>
</svelte:head>

<PageHeader />

<slot />

<PageFooter />
