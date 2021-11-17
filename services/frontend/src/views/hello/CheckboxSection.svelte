<script type="text/javascript">
    import CheckboxInput from '_partials/controls/CheckboxInput.svelte';

    let value = true;
</script>

<div class="section pl-0 pt-0">
    <h3 id="checkbox" class="title is-3">Checkboxes</h3>
    <CheckboxInput bind:value label="checkbox with label" />
    <CheckboxInput bind:value disabled label="disabled checkbox" />
    <CheckboxInput bind:value faded label="faded checkbox" />
    standalone: <CheckboxInput bind:value standalone />
</div>
