<script>
    import ButtonGroupInput from '_partials/controls/ButtonGroupInput.svelte';

    const options = [
        {
            key: 'grid',
            label: 'Grid',
            icon: 'grid-view'
        },
        {
            key: 'list',
            label: 'List',
            icon: 'list'
        }
    ];
    let value = 'grid';
</script>

<div class="section pl-0 pt-0">
    <h3 class="title is-3" id="button-groups">Button groups</h3>

    <ButtonGroupInput {options} bind:value />
</div>
