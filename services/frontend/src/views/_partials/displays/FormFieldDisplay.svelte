<script>
    import HelpDisplay from './HelpDisplay.svelte';
    import { getContext } from 'svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml';

    const msg = getContext('messages');

    function createTranslate(msg, messages) {
        return (key, scope = 'core', replacements) =>
            msg.translate(key, scope, messages, replacements);
    }
    $: __ = createTranslate(msg, $msg);

    export let error = null;
    export let id = null;

    export let label = null;
    export let compact = false;

    /**
     * tooltip to be shown on the side when hovering
     * the little (?) icon
     */
    export let tooltip = '';

    /**
     * tooltip type can be set to "upgrade" to introduce features
     * available after upgrading the account
     */
    export let tooltipType = null;
    export let tooltipPlacement = 'right';

    /**
     * Optional message to display below field controls.
     * Is only visible if no error is set.
     */
    export let message = null;

    /**
     * can be set to success, info etc
     */
    export let messageType = null;

    let className = '';
    export { className as class };
</script>

<style>
    .field {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    :global(:not(.field-body) > .field.compact:not(:last-child)) {
        margin-bottom: 0.5rem;
    }
    .field.compact .label {
        font-weight: 400;
    }
    .field.compact .label:not(:last-child) {
        margin-bottom: 0.15rem;
    }
    .control {
        flex-basis: 100%;
    }
</style>

<div class="field {className}" on:input class:compact>
    {#if label}
        <label for={id} class="label">{label}<slot name="labelExtra" /></label>
    {/if}
    {#if tooltip || $$slots.tooltip}
        <HelpDisplay type={tooltipType} placement={tooltipPlacement}>
            {#if tooltip}
                <div>{@html purifyHtml(tooltip)}</div>
            {/if}
            <slot name="tooltip" />
        </HelpDisplay>
    {/if}
    <div class="control">
        <slot {id} />
    </div>
    {#if error}
        <p class="help is-danger">
            {__('Error:')}
            {error}
        </p>
    {:else if message}
        <p class="help {messageType ? `is-${messageType}` : 'has-text-grey'}">
            {@html purifyHtml(message)}
        </p>
    {/if}
</div>
