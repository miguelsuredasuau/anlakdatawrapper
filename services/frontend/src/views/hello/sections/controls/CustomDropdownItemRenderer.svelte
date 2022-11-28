<script>
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    export let item;
</script>

<style>
    .swatch {
        display: inline-block;
        width: 18px;
        height: 18px;
        margin-right: 5px;
        vertical-align: sub;
        border-radius: 2px;
    }
</style>

<span class="swatch" style:background={item.value} />
{@html purifyHtml(item.label, '')}
