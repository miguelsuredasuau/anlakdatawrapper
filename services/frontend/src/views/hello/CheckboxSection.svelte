<script type="text/javascript">
    import CheckboxInput from '_partials/controls/CheckboxInput.svelte';

    let value = true;
</script>

<div class="section pl-0 pt-0">
    <h3 id="checkbox" class="title is-3">Checkboxes</h3>
    <div class="level">
        <div class="level-left">
            <div class="level-item">
                <CheckboxInput bind:value label="checkbox with label" />
            </div>
            <div class="level-item">
                <CheckboxInput bind:value disabled label="disabled checkbox" />
            </div>
            <div class="level-item"><CheckboxInput bind:value faded label="faded checkbox" /></div>
        </div>
    </div>
    standalone: <CheckboxInput bind:value standalone /><CheckboxInput
        bind:value
        standalone
    /><CheckboxInput bind:value standalone />
</div>
