<script>
    export let logo;
    export let purifyHtml;
    export let theme;
</script>

{#if logo.imgSrc}
    <img
        height={logo.height}
        src={logo.imgSrc}
        alt={'altText' in logo ? logo.altText : theme.title}
    />
{/if}
{#if logo.text}
    <span class="logo-text">
        {@html purifyHtml(logo.text)}
    </span>
{/if}
