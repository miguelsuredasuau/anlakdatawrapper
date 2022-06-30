<script>
    import IconDisplay from './IconDisplay.svelte';

    export let helpClass = '';
    export let uid = null;
    export let float = false;
    export let compact = false;
    export let type = null;

    let visible = false;
    let t = null;

    function handleHelpMouseenter() {
        const timeout = setTimeout(() => {
            visible = true;
        }, 400);
        t = timeout;
    }

    function handleHelpMouseleave() {
        clearTimeout(t);
        visible = false;
    }

    export let placement = 'right'; // only left and right

    const randomId = Math.ceil(Math.random() * 1e5).toString(36);
</script>

<style lang="scss">
    @import '../../../styles/export.scss';
    .sidehelp {
        position: relative;
        display: inline-flex;
        &-icon {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 1.5em;
            height: 1.5em;
            // reset default button border
            border: none;
            border-radius: 50%;
            background: $dw-shade-light;
            color: $dw-grey;
            font-size: $size-7;
            cursor: default;
            &:hover {
                background: $dw-grey-lighter;
                color: $dw-grey-dark;
            }
            &:focus + .sidehelp-content {
                visibility: visible;
            }
        }
        &-content {
            position: absolute;
            visibility: hidden;
            z-index: 1000;
            top: -1em;
            left: -1em;
            padding: 1em 1em 1em 3em;
            background: $primary-light;
            color: $primary;
            width: 240px;
            border-radius: $radius;
            box-shadow: $shadow-small;
            text-align: left;

            &.is-visible {
                visibility: visible;
            }
            & > :global(.icon) {
                font-size: $size-3;
                position: absolute;
                left: 0.45em;
                top: 0.45em;
            }
            & :global(a) {
                color: inherit;
                text-decoration: underline;
            }
        }

        &.open-to-left .sidehelp-content {
            left: auto;
            right: -1em;
            padding: 1em 3em 1em 1em;

            & > :global(.icon) {
                left: auto;
                right: 0.45em;
            }
        }

        &.upgrade {
            .sidehelp {
                &-icon {
                    background: lighten($dw-turquoise, 30);
                    color: $dw-turquoise-dark;
                }
                &-content {
                    background: $dw-turquoise-dark;
                    color: white;
                }
            }
        }
        &.floating {
            float: right;
            top: 0.35em;
        }
        &.small,
        &.normal,
        &.medium,
        &.large {
            top: 0.375em;
        }
        &.small {
            font-size: 0.75rem;
        }
        &.medium {
            font-size: 1.25rem;
        }
        &.large {
            font-size: 1.5rem;
        }
    }
</style>

<div
    class="sidehelp {helpClass}"
    class:compact
    class:floating={float}
    class:upgrade={type === 'upgrade'}
    class:open-to-left={placement === 'left'}
    on:mouseenter={handleHelpMouseenter}
    on:mouseleave={handleHelpMouseleave}
    data-uid={uid}
>
    <button class="sidehelp-icon" aria-labelledby={randomId}
        >{#if type === 'upgrade'}<IconDisplay icon="arrow-up-bold" />{:else}<IconDisplay
                icon="help"
            />{/if}</button
    >
    <div class="sidehelp-content" id={randomId} role="tooltip" class:is-visible={visible}>
        <IconDisplay icon={type === 'upgrade' ? 'arrow-up-circle' : 'help-circle'} />
        <slot />
    </div>
</div>
