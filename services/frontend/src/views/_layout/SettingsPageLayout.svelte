<script>
    import MainLayout from '_layout/MainLayout.svelte';
    import Menu from '_partials/Menu.svelte';

    export let settingsPages;
    export let title;

    export let loadPage;
</script>

<MainLayout {title}>
    <section class="header section py-5">
        <div class="container">
            <slot name="header" />
        </div>
    </section>
    <div class="container"><hr class="my-0" /></div>
    <section class="body section pt-5">
        <div class="container">
            <div class="columns is-variable is-6">
                <div class="column">
                    <Menu groups={settingsPages} {loadPage} />
                    <slot name="belowNav" />
                </div>
                <div class="column is-four-fifths">
                    <slot />
                </div>
            </div>
            <slot name="footer" />
        </div>
    </section>
</MainLayout>
