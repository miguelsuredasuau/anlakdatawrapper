<script>
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import { currentFolder } from './stores';

    export let folder;
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    .box {
        border: 1px solid $dw-grey-lighter;
        padding: 20px 25px;
        box-shadow: none;
        &:hover {
            border: 1px solid $dw-scooter-light;
        }
        :global(.icon) {
            color: $dw-scooter;
            font-size: 30px;
        }
    }
</style>

<a href={folder.path} on:click|preventDefault={() => ($currentFolder = folder)}>
    <div class="box has-border is-size-5 m-3">
        <SvgIcon icon="folder" className="mr-1" valign="middle" />
        <span class="has-text-weight-medium">{folder.name}</span>
        {#if folder.chartCount}<span class="has-text-grey">({folder.chartCount})</span>{/if}
    </div>
</a>
