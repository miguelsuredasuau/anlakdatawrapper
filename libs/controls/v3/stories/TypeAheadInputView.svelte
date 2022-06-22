<script>
    /* global process */
    import TypeAheadInput from '../TypeAheadInput.svelte';
    import TypeAheadCustomItem from '../TypeAheadCustomItem.svelte';

    export let options = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
        { label: 'Option C', value: 'c' },
        { label: 'Option D', value: 'd' }
    ];

    const assetURL = process.env.STORYBOOK_ICONS_URL;

    let valueA;
    let valueB;
    let valueC;
    let valueD;

    const ariaLabel = 'aria label';
    const icon = 'search';

    const search = async query => {
        if (!query) {
            return [];
        }
        await delay(1000);
        return [
            { label: 'The North', value: 'north' },
            { label: 'The Iron Islands', value: 'iron' },
            { label: 'The Riverlands', value: 'river' },
            { label: 'The Value of Arryn', value: 'arryn' },
            { label: 'The Westerlands', value: 'west' },
            { label: 'The Crownlands', value: 'crown' },
            { label: 'The Reach', value: 'reach' },
            { label: 'The Stormlands', value: 'storm' },
            { label: 'Dorn', value: 'dorne' }
        ];
    };
    const delay = async time => {
        return new Promise(resolve => setTimeout(resolve, time));
    };
</script>

<label class="mb-2">Default</label>
<TypeAheadInput bind:value={valueA} {options} placeholder="Placeholder" {ariaLabel} {assetURL} />
<div>Selected value: <b>{valueA && valueA.label}</b></div>
<hr />

<label class="mb-2">With icon</label>
<TypeAheadInput
    bind:value={valueB}
    {options}
    placeholder="Placeholder"
    {ariaLabel}
    {icon}
    {assetURL}
/>
<div>Selected value: <b>{valueB && valueB.label}</b></div>
<hr />

<label class="mb-2">With custom search</label>
<TypeAheadInput bind:value={valueC} {search} placeholder="Placeholder" {ariaLabel} {assetURL} />
<div>Selected value: <b>{valueC && valueC.label}</b></div>
<hr />

<label class="mb-2">With custom renderer</label>
<TypeAheadInput
    bind:value={valueD}
    {options}
    customItemRenderer={TypeAheadCustomItem}
    placeholder="Placeholder"
    {ariaLabel}
    {assetURL}
/>
<div>Selected value: <b>{valueD && valueD.label}</b></div>
<hr />

<label class="mb-2">Disabled</label>
<TypeAheadInput
    bind:value={valueA}
    {options}
    customItemRenderer={TypeAheadCustomItem}
    placeholder="Placeholder"
    {ariaLabel}
    {assetURL}
    {icon}
    disabled
/>
