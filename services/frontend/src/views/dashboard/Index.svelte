<script type="text/javascript">
    import Notification from '_partials/components/Notification.svelte';
    import MainLayout from 'layout/MainLayout.svelte';

    import ViewComponent from 'layout/partials/ViewComponent.svelte';

    import RecentVisualizations from './RecentVisualizations.svelte';
    import Welcome from './Welcome.svelte';

    export let __;
    export let notification;
    export let recentlyEdited;
    export let recentlyPublished;

    export let sidebarBoxes = [];
</script>

<style>
</style>

<MainLayout>
    <section class="section">
        <div class="container">
            <div class="columns is-variable is-8-fullhd">
                <div class="column is-8">
                    {#if recentlyEdited.length}
                        <RecentVisualizations {__} {recentlyEdited} {recentlyPublished} />
                    {:else}
                        <Welcome {__} />
                    {/if}
                </div>
                <div class="column">
                    {#if notification}
                        <Notification type={notification.type === 's' ? 'success' : 'warning'}
                            >{notification.message}</Notification
                        >
                    {/if}
                    {#each sidebarBoxes as box}
                        <ViewComponent {__} id={box.component} props={box.props} />
                    {/each}
                </div>
            </div>
        </div>
    </section>
</MainLayout>
