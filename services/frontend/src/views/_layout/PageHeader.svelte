<script>
    import { getContext } from 'svelte';
    import DatawrapperLogoDisplay from '_partials/displays/DatawrapperLogoDisplay.svelte';
    import NavBar from '_partials/navbar/NavBar.svelte';
    import { headerProps } from './stores';

    const HEADER_FULL_HEIGHT = 107;
    const SCROLL_THRESHOLD = 20;

    const config = getContext('config');
    const msg = getContext('messages');

    function createTranslate(msg, messages) {
        return (key, scope = 'core', replacements) =>
            msg.translate(key, scope, messages, replacements);
    }
    $: __ = createTranslate(msg, $msg);

    let isActive = false;
    let scrollY = 0;
    $: scrolledDown = scrollY > SCROLL_THRESHOLD;

    let innerHeight = 0;
    let headerHeight;
    $: stickyHeaderThreshold = $config.stickyHeaderThreshold;
    $: isHeaderSticky = innerHeight ? innerHeight > stickyHeaderThreshold : true;
    $: $headerProps = {
        isSticky: isHeaderSticky,
        height: headerHeight
    };
</script>

<style lang="scss">
    @import '../../styles/export.scss';

    header {
        background: white;
        border-bottom: 1px solid var(--color-dw-grey-lighter);
        border-top: 3px solid var(--color-dw-scooter);
        transition: padding 0.2s ease-in-out, margin 0.2s ease-in-out;
        padding: 0 1.5rem;
    }
    header.is-sticky {
        position: fixed !important;
        top: 0px;
        left: 0;
        right: 0;
        z-index: 1000;
    }
    .navbar {
        min-height: 2em;
        padding-top: 2em;
        padding-bottom: 2em;
        transition: padding 250ms;
    }
    .navbar-burger > span {
        height: 2px;
        width: 20px;
    }

    .navbar-brand {
        min-height: 0;
        .navbar-item {
            padding-top: 0;
            padding-bottom: 0;
        }
        :global(.logo-datawrapper) {
            width: 150px;
        }
    }

    .navbar-compact {
        :global(.logo-datawrapper) {
            max-width: 120px;
        }

        padding-top: 0.75em;
        padding-bottom: 0.75em;
    }
    @include until($navbar-breakpoint) {
        .navbar-brand .navbar-item {
            padding-left: 0;
        }
    }
    @include desktop {
        header {
            padding: 0 3rem;
        }
    }
</style>

<svelte:window bind:scrollY bind:innerHeight />

<header class:is-sticky={isHeaderSticky} id="top" bind:clientHeight={headerHeight}>
    <div class="container">
        <nav class="navbar" class:navbar-compact={scrolledDown} aria-label="main navigation">
            <div class="navbar-brand">
                <a class="navbar-item" href="/" style="line-height: 1">
                    <DatawrapperLogoDisplay />
                </a>

                <a
                    role="button"
                    class:is-active={isActive}
                    class="navbar-burger"
                    aria-label="menu"
                    aria-expanded="false"
                    href="#/mobile-menu"
                    on:click|preventDefault={() => (isActive = !isActive)}
                >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                </a>
            </div>
            <NavBar {isActive} {__} />
        </nav>
    </div>
</header>

{#if isHeaderSticky}
    <div style="height: {HEADER_FULL_HEIGHT}px;" />
{/if}
