<script>
    import DatawrapperLogoDisplay from '_partials/displays/DatawrapperLogoDisplay.svelte';
    import OutdatedBrowserDisplay from '_partials/displays/OutdatedBrowserDisplay.svelte';
    export let title;

    import { getContext } from 'svelte';
    const msg = getContext('messages');
    const browser = getContext('browser');

    function createTranslate(msg, messages) {
        return (key, scope = 'core') => msg.translate(key, scope, messages);
    }
    $: __ = createTranslate(msg, $msg);
</script>

<style lang="scss">
    @import 'bulma/sass/utilities/_all.sass';
    :global(html) {
        overflow-y: auto;
        background-color: var(--color-dw-scooter);
        background-image: url(/lib/static/img/dw-hero-16-9-bg.jpg);
    }

    @include desktop {
    }
    @media screen and (min-height: 700px) and (min-width: 600px) {
        :global(html) {
            overflow-y: hidden;
        }
        .page-content {
            max-height: 650px;
            overflow-y: auto;
        }
    }
</style>

<svelte:head>
    <title>Datawrapper{title ? ` - ${title}` : ''}</title>
</svelte:head>

<OutdatedBrowserDisplay />

{#if !$browser.isIE}
    <section class="hero is-fullheight">
        <div class="hero-body">
            <div class="container is-max-desktop box p-0 is-radiusless">
                <div class="columns is-gapless">
                    <div class="column is-one-third is-flex is-flex-direction-column">
                        <div
                            class="p-6 is-flex is-flex-direction-column is-justify-content-space-between is-flex-grow-1"
                        >
                            <DatawrapperLogoDisplay width="170px" />

                            <div class="terms is-size-7 is-hidden-mobile">
                                {@html __('signin / terms')}
                            </div>
                        </div>
                    </div>
                    <div class="column has-background-white-bis is-flex is-flex-direction-column">
                        <div
                            class="page-content p-6 is-flex is-flex-direction-column is-justify-content-space-between is-flex-grow-1"
                        >
                            <slot />
                            <div class="terms is-size-7 is-hidden-tablet mt-3">
                                {@html __('signin / terms')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
{/if}
