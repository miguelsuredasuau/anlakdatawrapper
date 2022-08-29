<script>
    import DropdownButton from '../DropdownButton.svelte';

    export let value = 'some-action';

    export let options = [
        {
            label: 'Some action',
            value: 'some-action'
        },
        {
            label: 'Another action',
            value: 'another-action'
        },
        {
            label: 'Yet another very long action',
            value: 'yet-another-very-long-action'
        }
    ];

    function handleDropdownButtonClick(event) {
        alert(`Clicked on button which has value "${event.detail}"`);
    }
</script>

<style>
    .wrap {
        margin-left: 50px;
        padding-left: 15px;
        border-left: 1px solid #ddd;
    }
    label {
        margin-bottom: 5px;
    }
    label:not(:first-child) {
        margin-top: 2em;
    }
</style>

<div class="wrap">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Default dropdown button</label>
    <DropdownButton bind:value {options} on:click={handleDropdownButtonClick} />

    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Left-aligned dropdown content</label>
    <DropdownButton bind:value {options} align="left" on:click={handleDropdownButtonClick} />

    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>With a custom button class "primary"</label>
    <DropdownButton
        bind:value
        {options}
        buttonClass="primary"
        on:click={handleDropdownButtonClick}
    />

    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Disabled</label>
    <DropdownButton bind:value {options} disabled on:click={handleDropdownButtonClick} />

    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Disabled, with a custom button class "primary"</label>
    <DropdownButton
        bind:value
        {options}
        disabled
        buttonClass="primary"
        on:click={handleDropdownButtonClick}
    />
</div>
