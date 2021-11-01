<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    export let __;

    export let folder;
</script>

<style>
    .section {
        padding: 2rem 3rem;
    }
</style>

<MainLayout title="Archive">
    <section class="section header">
        <div class="container">
            <h1 class="title">Visualization Archive</h1>
        </div>
    </section>
    <section class="section body">
        <div class="container">
            <div class="columns">
                <div class="column is-one-quarter">Folder Nav</div>
                <div class="column">Visualization Grid</div>
            </div>
        </div>
    </section>
</MainLayout>
