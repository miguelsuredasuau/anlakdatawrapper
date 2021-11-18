<script>
    import MainLayout from '_layout/MainLayout.svelte';
    import Menu from '_partials/Menu.svelte';

    export let settingsPages;
    export let title;

    export let loadPage;
</script>

<style type="text/css">
</style>

<MainLayout {title}>
    <section class="section">
        <div class="container">
            <slot name="header" />
            <div class="columns is-variable is-6">
                <div class="column">
                    <Menu groups={settingsPages} {loadPage} />
                    <slot name="belowNav" />
                </div>
                <div class="column is-four-fifths content">
                    <slot />
                </div>
            </div>
            <slot name="footer" />
        </div>
    </section>
</MainLayout>
