<script>
    import { getContext } from 'svelte';
    import VisArchive from './VisArchive.svelte';
    import TeamSelect from './TeamSelect.svelte';
    import { post, patch } from '@datawrapper/shared/httpReq';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import NavBarIcon from './NavBarIcon.svelte';

    export let isActive;
    export let __;

    const user = getContext('user');
    const config = getContext('config');
    const request = getContext('request');

    async function onNavItemClick(event, item) {
        if (item.type === 'logout') {
            event.preventDefault();
            await post('/v3/auth/logout');
            window.location.reload();
        } else if (item.type === 'language') {
            event.preventDefault();
            await patch('/v3/me', {
                payload: {
                    language: item.id
                }
            });
            window.location.reload();
        }
    }
</script>

<style lang="scss">
    @import 'bulma/sass/utilities/_all.sass';

    // Navbar Items
    .navbar-menu {
        :global(.navbar-item, .navbar-link) {
            border-radius: var(--radius);
        }
        :global(a.navbar-item:hover) {
            color: var(--color-dw-scooter);
        }
        :global(.navbar-item .icon) {
            margin-right: 1ex;
            color: var(--color-dw-scooter);
            font-size: 20px;
            width: 1em;
            height: 1em;
        }

        // Seperator (vertical)
        .navbar-separator {
            display: flex;
            background: var(--color-dw-grey-light);
            height: 3em;
            width: 1px;
            align-self: center;
        }
        // Drowpdown
        :global(.navbar-dropdown) {
            padding: 0.25rem 0;
        }
        :global(.navbar-dropdown .navbar-divider) {
            margin: 0.25rem 0;
        }
        :global(.navbar-item.has-dropdown .navbar-link:hover) {
            color: var(--color-dw-black-bis);
        }
        :global(.navbar-dropdown .navbar-item) {
            margin: 0 0.25rem;
        }

        // Create Menu: Active Team
        .active-team {
            background: var(--color-dw-white-ter);
            margin: 0.25rem 0 -0.25rem;
            border-radius: 0px 0px 5px 5px;

            :global(.icon) {
                font-size: 1.2em;
                color: var(--dw-grey-dark);
            }
        }
    }

    // Special styles for compact navbar, only applied to first level of navigation
    :global(.navbar-compact) .navbar-menu {
        .navbar-separator {
            transition: height 0.2s ease-in-out;
            height: 1.5em;
        }
        :not(.navbar-dropdown) > .navbar-item,
        :not(.navbar-dropdown) > .navbar-link {
            padding-top: 0.15rem;
            padding-bottom: 0.15rem;
            transition: padding 0.2s ease-in-out;
        }
    }

    // Navbar touch sizes adjustment
    @include touch {
        .navbar-menu {
            .navbar-item:not(:last-child),
            .navbar-link {
                border-radius: 0;
                border-bottom: 1px solid $grey-lighter;
            }
            .navbar-dropdown {
                .navbar-item {
                    border-bottom: none;
                    padding: 0.5rem;
                }
            }
        }
    }
    // Navbar dekstop sizes adjustments
    @include desktop {
        .navbar-menu {
            // Second level dropdown
            :global(.navbar-item.has-dropdown .navbar-item.has-dropdown .navbar-dropdown) {
                position: absolute;
                left: -100%;
                right: 100%;
                top: -6px;
                display: none;
            }
            :global(.navbar-item.has-dropdown .navbar-item.has-dropdown:hover .navbar-dropdown) {
                display: block;
            }
            // Adjustments to specific nav items
            // - style icon only items
            :global(.nav-item-admin > .navbar-link .navbar-title),
            :global(.nav-item-more > .navbar-link .navbar-title) {
                display: none;
            }
            :global(.nav-item-more > .navbar-link .icon),
            :global(.nav-item-admin > .navbar-link .icon) {
                margin-right: 0;
            }
            :global(.nav-item-more > .navbar-link .icon) {
                font-size: 30px;
            }
            :global(.just-arrow:hover:before) {
                content: '';
                display: block;
                position: absolute;
                left: -2.5em;
                bottom: 0;
                width: 2.5em;
                height: 1em;
                background: transparent;
            }
        }
    }
</style>

<div class="navbar-menu" class:is-active={isActive}>
    <div class="navbar-end">
        {#each $config.headerLinks as link}
            {#if link.type === 'separator'}
                <hr class="navbar-separator mx-3 my-0 is-hidden-touch" />
            {:else if link.type === 'visArchive'}
                <!-- visualization archive is a special component -->
                <VisArchive {link} {__} />
            {:else if link.submenuItems}
                <!-- top level navbar entry with submenu -->
                <div
                    class="navbar-item has-dropdown is-hoverable is-size-5 has-text-weight-medium ml-1 {link.class ||
                        ''}"
                    class:just-arrow={link.type === 'visArchive' &&
                        !link.title &&
                        !link.icon &&
                        !link.svgIcon}
                >
                    <a
                        href={link.url || '#/dropdown'}
                        on:click={event => onNavItemClick(event, link)}
                        class="navbar-link"
                        style={link.style || ''}
                        class:is-arrowless={link.type !== 'visArchive'}
                    >
                        <NavBarIcon item={link} />
                        <span class="navbar-title">{@html link.title || ''}</span></a
                    >
                    <!-- navbar dropdown menu -->
                    <div class="navbar-dropdown is-right is-boxed">
                        {#each link.submenuItems as subItem}
                            {#if subItem.type === 'separator'}
                                <hr class="navbar-divider" />
                            {:else if subItem.type === 'activeTeam'}
                                <div class="navbar-item active-team is-size-7 has-text-grey-dark">
                                    In: <SvgIcon
                                        icon="folder{$user.activeTeam ? '-shared' : ''}"
                                        className="mx-1"
                                    />
                                    {$user.activeTeam ? $user.activeTeam.name : 'My Charts'}
                                </div>
                            {:else if subItem.type === 'teamSelector'}
                                <TeamSelect {__} />
                            {:else if subItem.type === 'html'}
                                <div
                                    class="navbar-item has-text-weight-normal {subItem.class || ''}"
                                    on:click={event => onNavItemClick(event, subItem)}
                                    style={subItem.style || ''}
                                >
                                    {@html subItem.content}
                                </div>
                            {:else if subItem.submenuItems}
                                <!-- dropdown with dropdown -->
                                <a
                                    class="navbar-item has-dropdown is-hoverable has-text-weight-normal "
                                    href="#/dropdown"
                                >
                                    <NavBarIcon item={subItem} />
                                    <span>{@html subItem.title || ''}</span>
                                    <div class="navbar-dropdown is-right is-boxed">
                                        {#each subItem.submenuItems as subItem2}
                                            <a
                                                href="#/"
                                                class="navbar-item has-text-weight-normal {subItem2.class ||
                                                    ''}"
                                                on:click|preventDefault={event =>
                                                    onNavItemClick(event, subItem2)}
                                                style={subItem2.style}
                                            >
                                                <NavBarIcon item={subItem2} />
                                                <span class="navbar-title"
                                                    >{@html subItem2.title}</span
                                                >
                                            </a>
                                        {/each}
                                    </div>
                                </a>
                            {:else}
                                <a
                                    class="navbar-item has-text-weight-normal {subItem.class || ''}"
                                    href={subItem.url}
                                    on:click={event => onNavItemClick(event, subItem)}
                                    ><NavBarIcon item={subItem} />
                                    <span class="navbar-title">{@html subItem.title || ''}</span></a
                                >
                            {/if}
                        {/each}
                    </div>
                </div>
            {:else}
                <!-- top-level navbar link/icon -->
                <a
                    class:is-active={link.url === '/'
                        ? $request.path === '/'
                        : $request.path.startsWith(link.url)}
                    class="navbar-item is-size-5 has-text-weight-medium ml-1 {link.class || ''}"
                    on:click={event => onNavItemClick(event, link)}
                    href={link.url}
                    ><NavBarIcon item={link} /> <span>{@html link.title || ''}</span></a
                >
            {/if}
        {/each}
    </div>
</div>
