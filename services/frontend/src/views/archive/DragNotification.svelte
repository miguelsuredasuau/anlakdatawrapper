<script>
    import Notification from '_partials/components/Notification.svelte';
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
        <Notification className="is-size-4 has-text-centered" type="info" deletable={false}>
            {@html __(message)}
        </Notification>
    </div>
</div>
