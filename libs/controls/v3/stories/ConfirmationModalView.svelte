<script>
    import ConfirmationModal from '../ConfirmationModal.svelte';

    let modalRef;
</script>

<ConfirmationModal
    bind:this={modalRef}
    on:confirm={() => console.warn('Implement confirmation!')}
    on:dismiss={() => console.warn('Implement dismissal!')}
    isOpen
    confirmButtonIcon="checkmark-bold"
>
    <p>Some explanation text about the confirmation modal.</p>
</ConfirmationModal>

<button on:click={modalRef.open}>Open modal</button>
