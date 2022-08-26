<script>
    import IconDisplay from './IconDisplay.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let isOpen = false;
    export let title = 'Title';
    export let confirmButtonText = 'Confirm';
    export let backButtonText = 'Back';
    export let confirmButtonIcon = false;
    export let uid;

    export function open() {
        isOpen = true;
    }

    function dismiss() {
        isOpen = false;
        dispatch('dismiss');
    }

    function confirm() {
        isOpen = false;
        dispatch('confirm');
    }

    function handleWindowKeydown(event) {
        if (isOpen && event.key === 'Escape') {
            dismiss();
        }
    }
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

    .btn {
        padding-left: 25px;
        padding-right: 25px;
    }

    .back {
        font-weight: bold;
    }

    :global(.modal-content p) {
        font-weight: normal;
    }
</style>

<svelte:window on:keydown={handleWindowKeydown} />

{#if isOpen}
    <div class="modal" data-uid={uid}>
        <div on:keyup|stopPropagation class="modal-body">
            <button type="button" class="close" on:click={dismiss} aria-label={backButtonText}>
                <IconDisplay icon="close" size="20px" />
            </button>
            <div class="modal-content">
                <h1 class="modal-title mb-4">{@html title}</h1>
                <slot />
                <div class="actions pt-4 mt-4">
                    <button class="btn back" data-uid={uid && `${uid}-back`} on:click={dismiss}>
                        {@html backButtonText}
                    </button>
                    <button
                        class="btn btn-danger"
                        data-uid={uid && `${uid}-confirm`}
                        on:click={confirm}
                    >
                        {#if confirmButtonIcon}
                            <IconDisplay
                                icon={confirmButtonIcon}
                                class="mr-1"
                                size="1.3em"
                                valign="-0.3em"
                            />
                        {/if}
                        {@html confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop" on:click={dismiss} />
{/if}
