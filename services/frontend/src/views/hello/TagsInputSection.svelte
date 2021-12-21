<script type="text/javascript">
    import TagsInput from '_partials/controls/TagsInput.svelte';
    let tags = ['apple', 'banana'];
</script>

<div class="section pl-0 pt-0">
    <h3 id="tagsinput" class="title is-3">TagsInput</h3>
    <div class="columns">
        <div class="column is-variable"><TagsInput bind:tags /></div>
        <div class="column">
            <button class="button" on:click={() => (tags = ['apple', 'banana'])}>reset tags</button>
        </div>
    </div>
</div>
