<script type="text/javascript">
    import RadioInput from '_partials/controls/RadioInput.svelte';

    const options = [
        {
            value: '#c71e1d',
            label: 'firebrick'
        },
        {
            value: '#4688D7',
            label: 'blue'
        },
        {
            value: '#FFB327',
            label: 'orange'
        },
        {
            value: '#cf4870',
            label: 'red'
        }
    ];
    let value = '#c71e1d';
</script>

<div class="section pl-0 pt-0">
    <h3 id="radio" class="title is-3">Radio Inputs</h3>
    <div class="columns">
        <div class="column is-narrow">
            <div class="block">Normal: <RadioInput bind:value {options} /></div>
            <div class="block">Disabled: <RadioInput bind:value {options} disabled /></div>
            <div class="block">
                inline=false: <RadioInput bind:value {options} inline={false} />
            </div>
        </div>
        <div class="column">
            <span class="tag is-info" style="background:{value}">{value}</span>
        </div>
    </div>
</div>
