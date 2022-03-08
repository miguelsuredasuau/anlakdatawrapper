<script type="text/javascript">
    import FileInput from '_partials/controls/FileInput.svelte';
    import CheckboxInput from '_partials/controls/CheckboxInput.svelte';

    let showInfo = false;
    export let __;

    let valueSingle = null;
    let valueMultiple = null;
    let valueFolder = null;

    function serialize(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type
        };
    }
</script>

<div class="section pl-0 pt-0">
    <h3 id="file" class="title is-3">FileInput</h3>
    <div class="mb-2"><CheckboxInput bind:value={showInfo} label="show file(s) information" /></div>

    <div class="columns">
        <div class="column">
            <FileInput {__} {showInfo} bind:value={valueSingle} />
            <FileInput
                {__}
                label="Only PNG and JPG"
                accept="image/png,image/jpg"
                {showInfo}
                bind:value={valueSingle}
            />
            <pre
                class="mt-2">{valueSingle ? JSON.stringify(serialize(valueSingle), null,2) : null}</pre>
        </div>
        <div class="column">
            <FileInput
                {__}
                label="Multiple files"
                className="is-primary"
                {showInfo}
                multiple
                bind:value={valueMultiple}
            />
            <pre
                class="mt-2">{valueMultiple ? JSON.stringify(valueMultiple.map(serialize), null,2) : null}</pre>
        </div>
        <div class="column">
            <FileInput {__} label="Select folder" {showInfo} folder bind:value={valueFolder} />
            <pre
                class="mt-2">{valueFolder ? JSON.stringify(valueFolder.map(serialize), null,2) : null}</pre>
        </div>
    </div>
</div>
