<script>
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    export let icon;
    export let iconColor = 'grey-light';
</script>

<style lang="scss">
    @import '../../../styles/colors.scss';
    .box {
        border: 1px solid $dw-grey-lighter;
        box-shadow: none;
    }
    .box .is-pulled-right {
        position: relative;
        top: -10px;
    }
</style>

<div class="box">
    <div class="has-text-{iconColor} is-size-2 is-pulled-right">
        <SvgIcon {icon} />
    </div>
    {#if $$slots.title}
        <div class="content mb-0">
            <h3><slot name="title" /></h3>
        </div>
    {/if}

    <slot />
</div>
