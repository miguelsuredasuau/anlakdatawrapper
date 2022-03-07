<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    export let emailOpen;
    export let providers;
    export let signIn = true;
    export let target;
    export let __;

    $: showTwoColumns = providers.length > 3;
</script>

<style lang="scss">
    @import 'bulma/sass/utilities/_all.sass';

    $google: #ea4335;
    $facebook: #1877f2;
    $twitter: #1d9bf0;
    $okta: #00297a;
    $onelogin: #1c1f2a;
    $microsoft: #0072c6;

    .button {
        text-align: left;
        justify-content: left;
        padding-left: 3rem;
    }

    .provider-buttons {
        .button :global(.icon) {
            position: absolute;
            left: 0;
            top: 0;
            width: 2.4rem !important;
            height: 100% !important;
            border-top-left-radius: var(--radius);
            border-bottom-left-radius: var(--radius);
            background: fade-out(#333, 0.9);
            color: var(--color-dw-black-bis);
            margin-left: 0;
        }

        :global(.button.provider-facebook .icon) {
            background: fade-out($facebook, 0.9);
            color: $facebook;
        }
        :global(.button.provider-okta .icon) {
            background: fade-out($okta, 0.9);
            color: $okta;
        }
        :global(.button.provider-onelogin .icon) {
            background: fade-out($onelogin, 0.9);
            color: $onelogin;
        }
        :global(.button.provider-google .icon) {
            background: fade-out($google, 0.9);
            color: $google;
        }
        :global(.button.provider-twitter .icon) {
            background: fade-out($twitter, 0.9);
            color: $twitter;
        }
        :global(.button.provider-microsoft .icon) {
            background: fade-out($microsoft, 0.9);
            color: $microsoft;
        }
    }
    @include touch {
        .provider-buttons {
            max-width: 250px;
            &.two-columns {
                display: flex;
                flex-direction: column;
            }
        }
    }
    @include desktop {
        .provider-buttons {
            max-width: 220px;
            &.two-columns {
                columns: 2;
                max-width: 440px;
            }
        }
    }
</style>

<div class="provider-buttons">
    <button class="button provider-email mb-2 is-fullwidth" on:click={() => (emailOpen = true)}>
        <IconDisplay icon="mail" />
        {__(signIn ? 'signin / sign-in-using' : 'signin / sign-up-using')}
        {__('email')}</button
    >
</div>

<hr />
{#if showTwoColumns}
    <p>{__('signin / alternative-signin')}</p>
{/if}
<div class="provider-buttons" class:two-columns={showTwoColumns}>
    {#each providers as provider}
        <a
            href="{provider.url}{target ? `?ref=${target}` : ''}"
            class="button provider-{provider.label.toLowerCase()} mb-2 is-fullwidth"
        >
            <IconDisplay icon={provider.icon} />
            {showTwoColumns ? '' : __(signIn ? 'signin / sign-in-using' : 'signin / sign-up-using')}
            {provider.label}</a
        >
    {/each}
</div>
