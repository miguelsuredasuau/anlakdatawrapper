<script>
    import NotificationDisplay from '_partials/displays/NotificationDisplay.svelte';
    export let message;
    export let __;
</script>

<style lang="scss">
    @import '../../styles/colors.scss';

    .drag-notification {
        pointer-events: none;
        position: fixed;
        top: 30px;
        z-index: 1001;
        left: 0;
        right: 0;
        :global(.notification) {
            background-color: rgba($dw-blue, 0.9);
        }
    }
</style>

<div class="drag-notification">
    <div class="container">
        <NotificationDisplay className="is-size-4 has-text-centered" type="info" deletable={false}>
            {@html __(message)}
        </NotificationDisplay>
    </div>
</div>
