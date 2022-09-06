<script>
    import ModalDisplay from './ModalDisplay.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let isOpen = false;
    export let title = 'Title';
    export let primaryAction;
    export let secondaryAction = null;
    export let primaryActionText = 'Primary';
    export let secondaryActionText = 'Secondary';
    export let backButtonText = 'Back';
    export let uid;

    export const open = () => (isOpen = true);
    export const dismiss = () => {
        isOpen = false;
        dispatch('dismiss');
    };
</script>

<style>
    .btn:not(.btn-primary) {
        font-weight: bold;
    }

    .main-actions {
        display: flex;
        gap: 18px;
    }
</style>

<ModalDisplay bind:isOpen {title} {uid} on:dismiss>
    <svelte:fragment slot="content">
        <slot />
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <button class="btn" data-uid={uid && `${uid}-back`} on:click={dismiss}>
            {backButtonText}
        </button>

        <div class="main-actions">
            {#if secondaryAction}
                <button
                    class="btn"
                    data-uid={uid && `${uid}-secondary`}
                    on:click={secondaryAction}
                    on:click={dismiss}
                >
                    {secondaryActionText}
                </button>
            {/if}
            <button
                class="btn btn-primary"
                data-uid={uid && `${uid}-primary`}
                on:click={primaryAction}
                on:click={dismiss}
            >
                {primaryActionText}
            </button>
        </div>
    </svelte:fragment>
</ModalDisplay>
