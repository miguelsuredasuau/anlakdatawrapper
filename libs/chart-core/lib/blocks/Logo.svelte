<script>
    export let props;
    import LogoInner from './LogoInner.svelte';

    const { get, purifyHtml } = props;
    $: ({ chart, theme, logoId } = props);

    let logo;

    $: {
        const metadataLogo = get(chart, 'metadata.publish.blocks.logo');
        const themeLogoOptions = get(theme, 'data.options.blocks.logo.data.options', []);
        const thisLogoId = logoId || metadataLogo.id;
        logo = themeLogoOptions.find(logo => logo.id === thisLogoId);
        // fallback to first logo in theme options
        if (!thisLogoId || !logo) logo = themeLogoOptions[0] || {};
    }
</script>

{#if logo.url}
    <a
        href={logo.url}
        title={logo.linkTitle || logo.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
    >
        <LogoInner {logo} {purifyHtml} {theme} />
    </a>
{:else}
    <LogoInner {logo} {purifyHtml} {theme} />
{/if}
