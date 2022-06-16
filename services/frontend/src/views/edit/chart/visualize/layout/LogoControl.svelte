<script>
    import HorizontalFormFieldDisplay from '_partials/displays/HorizontalFormFieldDisplay.svelte';
    import get from '@datawrapper/shared/get';
    import SelectInput from '_partials/controls/SelectInput.svelte';
    import SwitchControl from '_partials/controls/SwitchControl.svelte';
    import { getContext } from 'svelte';

    const { chart, theme } = getContext('page/edit');

    export let __;
    export let requireUpgrade;

    $: logos = get($theme.data, 'options.blocks.logo.data.options', []);
    $: themeHasLogo = !!logos.find(logo => logo.text || logo.imgSrc);

    $: tooltip = requireUpgrade ? __('layout / logo / upgrade-info') : false;

    $: logoOptions = logos.map(({ id, title }) => ({ value: id, label: title }));
</script>

{#if logos.length > 1}
    <HorizontalFormFieldDisplay compact label={__('layout / logo')}>
        <SelectInput bind:value={$chart.metadata.publish.blocks.logo.id} options={logoOptions} />
    </HorizontalFormFieldDisplay>
{/if}
{#if requireUpgrade || themeHasLogo}
    <SwitchControl
        bind:value={$chart.metadata.publish.blocks.logo.enabled}
        disabled={requireUpgrade}
        label={__('layout / logo / show')}
        {tooltip}
        tooltipType="upgrade"
    />
{/if}
