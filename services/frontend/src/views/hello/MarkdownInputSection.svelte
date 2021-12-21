<script>
    import MarkdownInput from '_partials/controls/MarkdownInput.svelte';

    export let __;
    let value = '';
</script>

<div class="section pl-0 pt-0">
    <h3 id="markdown-input" class="title is-3">Markdown Input</h3>

    <div class="columns">
        <div class="column is-half">
            <MarkdownInput {__} bind:value aria-label="My label" style="height: 10em">
                slot
            </MarkdownInput>
        </div>
    </div>
</div>
