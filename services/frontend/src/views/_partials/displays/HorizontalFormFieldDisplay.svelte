<script>
    import FormFieldDisplay from './FormFieldDisplay.svelte';
    import HelpDisplay from './HelpDisplay.svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml';
    import { getContext } from 'svelte';

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

    /**
     * bulma supports 5 label paddings to make sure labels align
     * with the controls, possible values are `small`, `normal`, `medium`,
     * `large` and `off`
     */
    export let labelPadding = 'normal';
</script>

<style>
    .field.compact .label {
        font-weight: normal;
    }
    .field-label {
        text-align: left;
    }
    .field-body {
        flex-grow: 3;
    }
    .field-help {
        width: 2em;
        text-align: center;
    }
</style>

<div class="field is-horizontal {className}" on:input class:compact>
    {#if label}
        <div
            class="field-label"
            class:is-small={labelPadding === 'small'}
            class:is-normal={labelPadding === 'normal'}
            class:is-medium={labelPadding === 'medium'}
            class:is-large={labelPadding === 'large'}
        >
            <label for={id} class="label">{label}</label>
        </div>
    {/if}
    <div class="field-body">
        <FormFieldDisplay {id} {error} {compact} {message} {messageType}>
            <slot {id} />
        </FormFieldDisplay>
    </div>
    <div class="field-help">
        {#if tooltip || $$slots.tooltip}
            <HelpDisplay type={tooltipType} placement={tooltipPlacement} helpClass={labelPadding}>
                {#if tooltip}
                    <div>{@html purifyHtml(tooltip)}</div>
                {/if}
                <slot name="tooltip" />
            </HelpDisplay>
        {/if}
    </div>
</div>
