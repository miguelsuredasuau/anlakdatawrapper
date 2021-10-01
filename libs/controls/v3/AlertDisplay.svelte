<script>
    import upgradeIcon from './utils/upgradeIconSvg.mjs';
    import { __ } from '@datawrapper/shared/l10n.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let visible = false;
    export let type = '';
    export let closeable = true;
    export let uid;

    let className = '';
    export { className as class };
    export let closeFunc = null;

    function close() {
        if (closeFunc) {
            closeFunc();
        } else {
            visible = false;
            dispatch('close');
        }
    }
</script>

<style>
    .alert :global(a) {
        color: inherit;
        text-decoration: underline;
    }

    .alert-warning {
        background: #ffe;
        border: 1px solid #e9cc7f;
        color: #614a0d;
    }
    .alert-upgrade-info {
        display: flex;
        column-gap: 10px;
        padding: 11px 35px 11px 9px;
        color: #333333;
        border-color: #dddddd;
        background: transparent;
    }
    .alert-upgrade-info :global(a) {
        color: #1d81a2;
        text-decoration: none;
    }
    .alert-upgrade-info span.title {
        color: #09bb9f;
        font-weight: 700;
    }
    .upgrade-icon {
        display: inline-flex;
        border-width: 0px;
        background-color: rgb(57, 243, 187, 0.25);
        width: 18px;
        height: 18px;
        justify-content: center;
        border-radius: 50%;
    }
    .upgrade-icon :global(svg) {
        width: 12px;
    }
    .upgrade-icon :global(svg path) {
        fill: #09bb9f;
    }
</style>

{#if visible}
    <div
        class:alert-success={type === 'success'}
        class:alert-warning={type === 'warning'}
        class:alert-error={type === 'error'}
        class:alert-info={type === 'info'}
        class:alert-upgrade-info={type === 'upgrade-info'}
        class="alert {className}"
        data-uid={uid}
    >
        {#if type === 'upgrade-info'}
            <div class="icon"><span class="upgrade-icon">{@html upgradeIcon}</span></div>
            <div>
                <span class="title">{__('upgrade-available')}</span>
                {@html __('upgrade-info')}
            </div>
        {:else}
            {#if closeable}
                <button type="button" aria-label="close" class="close" on:click={close}
                    >&times;</button
                >
            {/if}
            <slot>content</slot>
        {/if}
    </div>
{/if}
