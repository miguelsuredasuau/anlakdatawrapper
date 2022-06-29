<script>
    import IconBox from '_partials/displays/IconBox.svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    export let __;

    const message = __('dashboard / checks / email-setup / setup')
        .replace('[[', '<a href="/account/profile">')
        .replace(']]', '</a>');
</script>

<IconBox icon="mail">
    <span slot="title">
        {__('dashboard / checks / email-setup / title')}
    </span>

    <p>{@html purifyHtml(message)}</p>
</IconBox>
