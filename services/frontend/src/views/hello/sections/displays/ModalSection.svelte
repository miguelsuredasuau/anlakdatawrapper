<script>
    import ModalDisplay from '_partials/displays/ModalDisplay.svelte';
    import CodeHighlight from '../../CodeHighlight.svelte';
    import { getContext } from 'svelte';

    const { showConfirmationModal } = getContext('layout/main');

    let open = false;
    let open2 = false;
    let msg = '';
    let msg2 = '';

    function confirmed() {
        open = false;
        open2 = false;
        msg = 'You confirmed!';
        setTimeout(() => {
            msg = '';
        }, 1000);
    }

    function cancel() {
        open = false;
        open2 = false;
        msg = 'You cancelled';
        setTimeout(() => {
            msg = '';
        }, 1000);
    }

    async function confirm2() {
        const res = await showConfirmationModal({
            title: 'Any title',
            body: 'Please make a decision now!',
            yesOption: 'Always click yes',
            yesIcon: 'checkmark-bold',
            noOption: 'Cancel'
        });
        msg2 = res ? 'good choice' : '...';
        setTimeout(() => {
            msg2 = '';
        }, 1000);
    }

    const code = `<sc${'ript>'}
    import { getContext } from 'svelte';
    const { showConfirmationModal } = getContext('layout/main');

    async function confirm() {
        const confirmed = await showConfirmationModal({
            title: 'Any title',
            body: 'Please make a decision now!',
            yesOption: 'Always click yes',
            yesIcon: 'checkmark-bold',
            noOption: 'Cancel'
        });
        if (confirmed) {
            // do it!
        }
    }
</sc${'ript>'}

<button on:click={confirm} class="button">confirm!</button>
`.trim();
</script>

<div class="section pl-0 pt-0">
    <h3 id="modal" class="title is-3">Standard confirmation modals</h3>
    <div class="buttons">
        <button on:click={confirm2} class="button is-large is-primary">{msg2 || 'confirm'}</button>
    </div>

    <h3 class="title is-4 has-text-grey">To open the "system" confirmation modal run this:</h3>

    <CodeHighlight {code} />
</div>

<ModalDisplay maxWidth="50em" closeable={false} bind:open>
    <div class="box">
        <h3 class="title is-3">Heads up!</h3>
        <p class="is-size-5 mb-5">This modal really needs your attention!</p>
        <div class="buttons">
            <button on:click={confirmed} class="button is-primary">Confirmed!</button>
            <button on:click={cancel} class="button">Back to safety</button>
        </div>
    </div>
</ModalDisplay>

<ModalDisplay maxWidth="50em" closeable={true} bind:open={open2}>
    <p class="modal-card-title" slot="header">Heads up!</p>

    <p class="subtitle mb-5">This modal really needs your attention!</p>

    <div slot="footer">
        <div class="buttons">
            <button on:click={confirmed} class="button is-primary"> Confirmed! </button>
            <button on:click={cancel} class="button">Back to safety</button>
        </div>
    </div>
</ModalDisplay>

<div class="section pl-0 pt-0">
    <h3 id="modal" class="title is-3">Custom modals</h3>
    <div class="buttons">
        <button on:click={() => (open = true)} class="button is-large is-primary"
            >{msg || 'open modal!'}</button
        >
        <button on:click={() => (open2 = true)} class="button is-large is-primary"
            >{msg || 'open modal card!'}</button
        >
    </div>
</div>
