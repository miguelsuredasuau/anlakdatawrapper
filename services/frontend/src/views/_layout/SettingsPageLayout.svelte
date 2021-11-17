<script>
    import MainLayout from '_layout/MainLayout.svelte';
    import Menu from '_partials/Menu.svelte';

    export let settingsPages;
    export let title;

    export let loadPage;
</script>

<style type="text/css">
</style>

<MainLayout title={`Settings - ${title}`}>
    <section class="section">
        <div class="container">
            <div class="columns is-variable is-6">
                <div class="column">
                    <Menu groups={settingsPages} {loadPage} />
                    <slot name="belowNav" />
                </div>
                <div class="column is-four-fifths content">
                    <h1 class="title">Settings >> {title}</h1>
                    <slot />
                </div>
            </div>
        </div>
    </section>
</MainLayout>
