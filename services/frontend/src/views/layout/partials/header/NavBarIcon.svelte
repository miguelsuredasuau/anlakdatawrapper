<script>
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    export let item;
</script>

<style>
</style>

{#if item.svgIcon}<SvgIcon
        size={item.svgIconSize}
        crisp={!!item.svgIconCrisp}
        valign="top"
        icon={item.svgIcon}
        className="{item.title ? '' : 'mr-0'} {item.svgIconClass || ''}"
    />{/if}{#if item.fontIcon}<span class="icon"><i class={item.fontIcon} /></span>{/if}
