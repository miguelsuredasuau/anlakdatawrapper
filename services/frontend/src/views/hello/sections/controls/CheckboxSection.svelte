<script type="text/javascript">
    import CheckboxInput from '_partials/controls/CheckboxInput.svelte';

    let value = true;
</script>

<div class="section pl-0 pt-0">
    <h3 id="checkbox" class="title is-3">Checkboxes</h3>
    <div class="columns">
        <div class="column">
            <div class="block">
                <div class="label">Inline</div>
                <div>
                    <CheckboxInput bind:value label="checkbox with label" />

                    <CheckboxInput bind:value disabled label="disabled checkbox" />

                    <CheckboxInput bind:value label="with help" help="Help me!" />

                    <CheckboxInput bind:value faded label="faded checkbox" />

                    <CheckboxInput
                        bind:value
                        label="This checkbox has a very long label to illustrate line wrapping: Lorem ipsum dolor sit amet"
                    />
                </div>
            </div>
            <div class="block">
                <div class="label">Standalone</div>
                <CheckboxInput bind:value standalone /><CheckboxInput
                    bind:value
                    standalone
                /><CheckboxInput bind:value standalone />
            </div>
        </div>
        <div class="column is-half">
            <div class="label">Different sizes:</div>
            {#each [7, 6, 5, 4, 3] as size}
                <div class="is-size-{size}">
                    <CheckboxInput bind:value label="Size {size}" />
                </div>
            {/each}
        </div>
    </div>
</div>
