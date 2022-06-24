<script>
    function causeError() {
        throw new Error('This is a serious error!');
    }
</script>

<div class="section pl-0 pt-0">
    <h3 id="errors">Errors</h3>
    <div class="content">
        <p>Finally,</p>
        <p>
            <button class="button is-danger" on:click={causeError}>Throw an error!</button>
        </p>
        <p>to test source maps in Svelte error stacktraces</p>
    </div>
</div>
