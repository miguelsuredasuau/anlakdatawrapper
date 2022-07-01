<script>
    import SelectInput from '_partials/controls/SelectInput.svelte';
    import { getContext } from 'svelte';

    const { chart, locales } = getContext('page/edit');

    export let __;

    $: localeOptions = $locales.map(({ id, title }) => ({
        value: id,
        label: `${title} (${id})`
    }));
</script>

<h4 class="title is-4 mb-3">{__('visualize / layout / locale-select / hed')}</h4>

<p class="mb-2">{__('visualize / layout / locale-select / explainer')}</p>
<SelectInput options={localeOptions} bind:value={$chart.language} />
