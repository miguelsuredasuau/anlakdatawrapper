<script>
    import IconDisplay from './IconDisplay.svelte';

    /**
     * Control the buttons underline decoration.
     *
     * true:    always show underline
     * false:   never show underline
     * 'hover': show underline only on hover
     *
     * @var {true | false | 'hover'}
     */
    export let underline = true;
    export let disabled = false;

    export let href = null;
    export let tag = href ? 'a' : 'button';

    export let icon;

    let className = '';
    export { className as class };

    export let uid = null;
</script>

<style lang="scss">
    .link {
        appearance: none;
        background: none;
        border: none;
        color: $link;
        cursor: pointer;
        padding: 0;
        border-radius: 0;
        display: inline-flex;
        align-items: center;

        &:not(.link-underline) {
            text-decoration: none;
        }

        &.link-underline span {
            text-decoration: underline;
        }

        &.link-underline-hover:hover span {
            text-decoration: underline;
        }

        &:hover {
            color: $link-hover;
        }

        &[disabled] {
            pointer-events: none;
            opacity: 0.5;
        }

        & :global(.link-icon) {
            margin-right: 0.4em;
        }

        /**
         * We had to add the .button class to align the styling (icon sizing, line-height,
         * etc.) with the customized bulma buttons without unnecessary duplication.
         * The following section is needed to get rid of the button specific styles.
         */
        box-shadow: none !important;
        height: auto;
        &:before {
            display: none !important;
        }
    }
</style>

<svelte:element
    this={tag}
    on:click|preventDefault
    {href}
    disabled={disabled || null}
    class="button link {className}"
    class:link-underline={underline === true}
    class:link-underline-hover={underline === 'hover'}
    data-uid={uid}
    {...$$restProps}
>
    {#if icon}
        <IconDisplay {icon} className="link-icon" />
    {/if}
    <span>
        <slot />
    </span>
</svelte:element>
