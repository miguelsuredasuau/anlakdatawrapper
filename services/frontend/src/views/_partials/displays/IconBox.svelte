<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    export let icon;
    export let iconColor = 'grey-light';
    export let borderColor = null;

    let className = '';
    export { className as class };

    export let uid;
</script>

<style lang="scss">
    @import '../../../styles/export.scss';
    .box {
        border: 1px solid $dw-grey-lighter;
        box-shadow: none;
    }
    .box .is-pulled-right {
        position: relative;
        top: -10px;
    }
    .box.is-primary {
        background-color: $primary;
        border-color: transparent;

        :global(:not(.button)) {
            color: $primary-light;
        }
        :global(.icon) {
            opacity: 0.5;
        }
    }
</style>

<div
    class="box {className}"
    style={borderColor ? `border-color: ${borderColor};` : null}
    data-uid={uid}
>
    <div class="has-text-{iconColor} is-size-2 is-pulled-right">
        <IconDisplay {icon} />
    </div>
    {#if $$slots.title}
        <div class="content mb-0">
            <h3><slot name="title" /></h3>
        </div>
    {/if}

    <slot />
</div>
