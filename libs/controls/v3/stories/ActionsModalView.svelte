<script>
    import ActionsModal from '../ActionsModal.svelte';

    let modalRef;
</script>

<ActionsModal
    bind:this={modalRef}
    isOpen
    primaryAction={() => console.warn('Implement primary action!')}
    secondaryAction={() => console.warn('Implement secondary action!')}
>
    <p>Some explanation text about the actions modal.</p>
</ActionsModal>

<button on:click={modalRef.open}>Open modal</button>
