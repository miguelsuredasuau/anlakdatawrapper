<script>
    import CodeMirrorInput from '_partials/controls/CodeMirrorInput.svelte';

    let json = { someJSON: ['foo', 'bar', 'baz'] };
    let jsonValue = JSON.stringify(json, null, 4);
    let lessValue = '.some-less-code {\n\tcolor: red\n}';
    let readOnly = true;
</script>

<div class="section pl-0 pt-0">
    <h3 id="codemirror" class="title is-3">CodeMirror Input</h3>
    <div class="columns">
        <div class="column is-half">
            <CodeMirrorInput bind:value={lessValue} mimeType="text/x-less" height="150px" />
        </div>
        <div class="column is-half">
            <CodeMirrorInput
                bind:value={jsonValue}
                {readOnly}
                mimeType="application/json"
                height="150px"
            >
                <div slot="topRight">
                    <button on:click={() => (readOnly = !readOnly)} class="button is-primary">
                        ReadOnly: {readOnly}
                    </button>
                </div>
            </CodeMirrorInput>
        </div>
    </div>
</div>
