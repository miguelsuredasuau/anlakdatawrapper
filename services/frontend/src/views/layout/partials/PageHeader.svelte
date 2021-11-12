<script>
    import { getContext } from 'svelte';
    import DatawrapperLogo from '_partials/DatawrapperLogo.svelte';
    import NavBar from './header/NavBar.svelte';

    const config = getContext('config');
    const msg = getContext('messages');

    let __;
    $: {
        __ = (key, scope = 'core') => msg.translate(key, scope, $msg);
    }

    $: stickyHeaderThreshold = $config.stickyHeaderThreshold;

    let isActive = false;
    let scrollY = 0;
    $: scrolledDown = scrollY > 0;
    $: logoScale = scrolledDown ? 35 / 45 : 1;

    let innerHeight = 0;
</script>

<style lang="scss">
    header {
        background: white;
        border-bottom: 1px solid var(--color-dw-grey-lighter);
        border-top: 3px solid var(--color-dw-scooter);
        transition: padding 0.2s ease-in-out, margin 0.2s ease-in-out;
    }
    header.is-sticky {
        position: sticky;
        top: 0px;
        z-index: 1000;
    }
    .navbar {
        min-height: 2em;
        padding-top: 2em;
        padding-bottom: 2em;
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
</style>

<svelte:window bind:scrollY bind:innerHeight />

<header class:is-sticky={innerHeight > stickyHeaderThreshold} id="top">
    <div class="container">
        <nav
            class="navbar"
            class:navbar-compact={scrolledDown}
            role="navigation"
            aria-label="main navigation"
        >
            <div class="navbar-brand">
                <a class="navbar-item" href="/" style="line-height: 1">
                    <DatawrapperLogo />
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
