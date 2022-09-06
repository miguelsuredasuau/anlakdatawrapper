<script>
    import IconDisplay from './IconDisplay.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let isOpen = false;
    export let title = 'Title';
    export let uid;

    export const open = () => (isOpen = true);
    export const dismiss = () => {
        isOpen = false;
        dispatch('dismiss');
    };

    const handleKeyDown = event => isOpen && event.key === 'Escape' && dismiss();
</script>

<style>
    .modal-title {
        font-size: 18px;
        font-weight: 500;
        line-height: 1.3;
    }

    .modal-content {
        padding: 25px 30px;
        color: #333333;
    }

    .actions {
        border-top: 1px solid #ececec;
        display: flex;
        justify-content: space-between;
    }

    .close {
        opacity: 0.4;
    }

    .close:hover,
    .close:focus,
    .close:active {
        opacity: 0.5;
    }

    :global(.modal-content p) {
        font-weight: normal;
    }
</style>

<svelte:window on:keydown={handleKeyDown} />

{#if isOpen}
    <div class="modal" data-uid={uid}>
        <div on:keyup|stopPropagation class="modal-body">
            <button type="button" class="close" on:click={dismiss} aria-label="Back">
                <IconDisplay icon="close" size="20px" />
            </button>
            <div class="modal-content">
                <h1 class="modal-title mb-4">{@html title}</h1>
                <slot name="content" />
                <div class="actions pt-4 mt-4">
                    <slot name="actions" />
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop" on:click={dismiss} />
{/if}
