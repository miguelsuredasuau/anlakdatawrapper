<script>
    import SnackbarDisplay from '../SnackbarDisplay.svelte';
    import SnackbarButton from '../SnackbarButton.svelte';
    import SnackbarText from '../SnackbarText.svelte';

    export let lorem = '';

    let clicked = false;

    let closed1 = false;
    let closed2 = false;
    let closed3 = false;
    let closed4 = false;
    let closed5 = false;
    let closed6 = false;
    let closed7 = false;
    let closed8 = true;
    let closed9 = false;
    let closed10 = false;

    function handleClick() {
        clicked = true;
    }
</script>

<style>
    .container {
        position: relative;
        width: 660px;
        height: 120px;
        background: #eee;
    }

    :global(.my-snackbar) {
        bottom: auto !important;
        top: 5px;
    }
    :global(.my-snackbar button),
    :global(.my-snackbar span) {
        background-color: #b94a48 !important;
    }
</style>

<h3>close automatically after default delay</h3>

<div class="container">
    <button on:click={() => (closed1 = !closed1)}>toggle</button>
    <SnackbarDisplay bind:closed={closed1}>
        <SnackbarText>Successfully pasted your data into the table.</SnackbarText>
        <SnackbarButton on:click={handleClick}><i class="fa fa-undo" /> Revert</SnackbarButton>
    </SnackbarDisplay>
</div>

<h3>close automatically after custom delay</h3>

<div class="container">
    <button on:click={() => (closed2 = !closed2)}>toggle</button>
    <SnackbarDisplay bind:closed={closed2} delay="2000">
        <SnackbarText>Successfully pasted your data into the table.</SnackbarText>
        <SnackbarButton on:click={handleClick}><i class="fa fa-undo" /> Revert</SnackbarButton>
    </SnackbarDisplay>
</div>

<h3>close manually, text, no buttons</h3>

<div class="container">
    <button on:click={() => (closed3 = !closed3)}>toggle</button>
    <SnackbarDisplay bind:closed={closed3} delay="0">
        <SnackbarText>Successfully pasted your data into the table.</SnackbarText>
    </SnackbarDisplay>
</div>

<h3>close manually, no text, one button</h3>

<div class="container">
    <button on:click={() => (closed4 = !closed4)}>toggle</button>
    <SnackbarDisplay bind:closed={closed4} delay="0">
        <SnackbarButton on:click={handleClick}><i class="fa fa-undo" /> Revert</SnackbarButton>
    </SnackbarDisplay>
</div>

<h3>close manually, text, several buttons</h3>

<div class="container">
    <button on:click={() => (closed5 = !closed5)}>toggle</button>
    <SnackbarDisplay bind:closed={closed5} delay="0">
        <SnackbarText>Successfully pasted your data into the table.</SnackbarText>
        <SnackbarButton on:click={handleClick}><i class="fa fa-undo" /> Revert</SnackbarButton>
        <SnackbarButton on:click={handleClick}>Spam</SnackbarButton>
    </SnackbarDisplay>
</div>

<h3>close manually, no text, several buttons</h3>

<div class="container">
    <button on:click={() => (closed6 = !closed6)}>toggle</button>
    <SnackbarDisplay bind:closed={closed6} delay="0">
        <SnackbarButton on:click={handleClick}><i class="fa fa-undo" /> Revert</SnackbarButton>
        <SnackbarButton on:click={handleClick}>Spam</SnackbarButton>
    </SnackbarDisplay>
</div>

<h3>close manually, text, one button, custom style</h3>

<div class="container">
    <button on:click={() => (closed7 = !closed7)}>toggle</button>
    <SnackbarDisplay bind:closed={closed7} delay="0" class="my-snackbar">
        <SnackbarText>Successfully pasted your data into the table.</SnackbarText>
        <SnackbarButton on:click={handleClick}><i class="fa fa-undo" /> Revert</SnackbarButton>
    </SnackbarDisplay>
</div>

<h3>closed by default</h3>

<div class="container">
    <button on:click={() => (closed8 = !closed8)}>toggle</button>
    <SnackbarDisplay bind:closed={closed8}>
        <SnackbarText>Successfully pasted your data into the table.</SnackbarText>
    </SnackbarDisplay>
</div>

<h3>with background text</h3>

<div class="container">
    <p>{@html lorem}</p>
    <button on:click={() => (closed9 = !closed9)}>toggle</button>
    <SnackbarDisplay bind:closed={closed9}>
        <SnackbarText>Successfully pasted your data into the table.</SnackbarText>
        <SnackbarButton on:click={handleClick}><i class="fa fa-undo" /> Revert</SnackbarButton>
    </SnackbarDisplay>
</div>

<h3>with long text</h3>

<div class="container">
    <button on:click={() => (closed10 = !closed10)}>toggle</button>
    <SnackbarDisplay bind:closed={closed10} delay="0">
        <SnackbarText
            >Wir haben deine Daten ersetzt. Möchtest du die eingefügten Zellen stattdessen mit
            deinen alten Daten zusammenführen?</SnackbarText
        >
        <SnackbarButton on:click={handleClick}>Zusammenführen</SnackbarButton>
    </SnackbarDisplay>
</div>

<code style="margin-top: 20px">
    <strong>Some Snackbar button was clicked:</strong>
    {clicked}
</code>
