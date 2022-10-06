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
    let value2 = 1;
</script>

<div class="section pl-0 pt-0">
    <h3 id="radio" class="title is-3">Radio Inputs</h3>
    <div class="columns">
        <div class="column is-narrow">
            <div class="block">
                <div class="label">Normal:</div>
                <RadioInput bind:value {options} />
            </div>
            <div class="block">
                <div class="label">Disabled:</div>
                <RadioInput bind:value {options} disabled />
            </div>
            <div class="block">
                <div class="label">Indeterminate:</div>
                <RadioInput bind:value {options} indeterminate />
            </div>
            <div class="block">
                <div class="label">inline=false:</div>
                <RadioInput bind:value {options} inline={false} />
            </div>
        </div>
        <div class="column">
            <span class="tag is-info" style="background:{value}">{value}</span>
        </div>
        <div class="column is-half">
            <div class="label">Different sizes:</div>
            {#each [7, 6, 5, 4, 3] as size}
                <div class="is-size-{size}">
                    <RadioInput
                        bind:value={value2}
                        options={[
                            { value: 1, label: `Size ${size}` },
                            { value: 2, label: `Foo` },
                            { value: 3, label: `Bar` }
                        ]}
                    />
                </div>
            {/each}
            <div class="label mt-4">Indeterminate sizes:</div>
            {#each [7, 6, 5, 4, 3] as size}
                <div class="is-size-{size}">
                    <RadioInput
                        bind:value={value2}
                        options={[
                            { value: 1, label: `Size ${size}` },
                            { value: 2, label: `Foo` }
                        ]}
                        indeterminate
                    />
                </div>
            {/each}
        </div>
    </div>
</div>
