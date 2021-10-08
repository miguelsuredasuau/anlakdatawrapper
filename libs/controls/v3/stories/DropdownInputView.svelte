<script>
    import DropdownInput from '../DropdownInput.svelte';

    export let lorem = '';
    let open = false;
</script>

<style>
    label {
        margin-bottom: 5px;
    }
    label:not(:first-child) {
        margin-top: 2em;
    }
    p {
        margin: 5px 10px;
    }
</style>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>Default button and content</label>
<DropdownInput />

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>Custom button</label>
<DropdownInput>
    <div slot="button"><i class="fa fa-chevron-circle-down" /> Click me</div>
</DropdownInput>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>Custom content</label>
<DropdownInput width="50ex">
    <div slot="content">
        <p>{@html lorem}</p>
    </div>
</DropdownInput>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>Custom button and content</label>
<DropdownInput width="50ex" bind:visible={open}>
    <div slot="button">
        <button class="btn" class:btn-primary={!open}
            ><i class="fa fa-info-circle" /> Click to read {open ? 'less' : 'more'}</button
        >
    </div>
    <div slot="content">
        <p>{@html lorem}</p>
    </div>
</DropdownInput>
