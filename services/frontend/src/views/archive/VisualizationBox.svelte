<script>
    import CheckboxInput from '../_partials/controls/CheckboxInput.svelte';
    import Dropdown from '../_partials/components/Dropdown.svelte';
    import SvgIcon from '../layout/partials/SvgIcon.svelte';
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    import { getContext } from 'svelte';
    import { selectedCharts } from './stores';

    const config = getContext('config');
    const { dayjs } = getContext('libraries');
    const { deleteChart, duplicateChart, openChart } = getContext('page/archive');

    export let chart;
    export let __;
    export let sortField = 'last_modified_at';

    let isDropdownActive = false;

    $: selected = $selectedCharts.has(chart);
    $: dateLine =
        sortField === 'last_modified_at'
            ? `${__('dashboard / visualization / last-edited')} ${dayjs(
                  chart.last_modified_at
              ).fromNow()}`
            : sortField === 'published_at'
            ? `${__('dashboard / visualization / published')} ${dayjs(
                  chart.published_at
              ).fromNow()}`
            : '';
    $: thumbnail =
        (chart.thumbnails && chart.thumbnails.plain) ||
        `//${$config.imageDomain}/${chart.id}/${chart.thumbnailHash}/plain.png`;

    function toggleChart() {
        if (selected) {
            if ($selectedCharts.delete(chart)) {
                $selectedCharts = $selectedCharts;
            }
        } else {
            $selectedCharts = $selectedCharts.add(chart);
        }
    }

    function handleDuplicateButtonClick() {
        duplicateChart(chart, true);
        isDropdownActive = false;
    }

    function handleDeleteButtonClick() {
        deleteChart(chart);
        isDropdownActive = false;
    }
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    .box {
        position: relative;
        border: 1px solid $dw-grey-lighter;
        padding: 10px;
        box-shadow: none;
        &:hover {
            border-color: $dw-grey;
            background-color: $dw-grey-lightest;
        }
        &.selected {
            border-color: $dw-scooter-light;
            background-color: $dw-scooter-lightest;
        }
        a {
            display: block;
            padding: 15px;
            padding-bottom: 5px;
            background: $dw-white;
        }
        .title {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .box-checkbox {
            display: none;
            position: absolute;
            left: 3px;
            top: 3px;
            padding: 5px;
            border-radius: 4px;
            line-height: 14px;
        }
        &:hover .box-checkbox {
            display: block;
            background-color: $dw-grey-lightest;
        }
        &.selected .box-checkbox {
            display: block;
        }
        &.selected:hover .box-checkbox {
            background-color: transparent;
        }
        :global(.dropdown) {
            position: absolute;
            top: 0;
            right: 0;
        }
        .context-menu-button {
            display: none;
            width: 28px;
            height: 26px;
            background-color: $dw-grey-lightest;
            border-radius: 4px;
            cursor: pointer;
            color: $dw-grey-dark;
        }
        &:hover .context-menu-button {
            display: block;
        }
        &.selected .context-menu-button {
            background-color: $dw-scooter-lightest;
            color: $dw-scooter;
        }
        .context-menu-button :global(.icon) {
            position: absolute;
            bottom: 2px;
            left: 2px;
        }
        :global(.dropdown-menu) {
            left: auto;
            top: -4px;
            right: -4px;
            padding-top: 0;
            filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.15));
        }
        .dropdown-item {
            padding: 0;
        }
        :global(.dropdown-item a),
        :global(.dropdown-item .link) {
            display: block;
            color: $dw-black-bis;
            cursor: pointer;
            padding: 0.375rem 1rem;
        }
        :global(.dropdown-item a:hover),
        :global(.dropdown-item .link:hover) {
            background-color: $dw-scooter-lightest;
        }
        :global(.dropdown-item .icon) {
            margin-right: 4px;
        }
    }
</style>

<div class="box has-border" class:selected>
    <a on:click|preventDefault={() => openChart(chart)} href="/chart/{chart.id}/edit">
        <figure class="image is-4by3">
            <figcaption title={purifyHTML(chart.title, '')} class="title is-6 mb-2">
                {purifyHTML(chart.title, '')}
            </figcaption>
            <img alt="preview" src={thumbnail} />
        </figure>
        {#if dateLine}
            <div class="mt-2 has-text-grey-dark is-size-7">{dateLine}</div>
        {/if}
    </a>
    <div class="box-checkbox">
        <CheckboxInput
            value={selected}
            on:click={toggleChart}
            label={__('dashboard / visualization / select')}
            standalone
        />
    </div>
    <Dropdown bind:active={isDropdownActive}>
        <div slot="trigger" class="context-menu-button">
            <SvgIcon icon="menu-vertical" size="18px" />
        </div>
        <div slot="content" class="dropdown-content">
            <div class="dropdown-item">
                <a href="/chart/{chart.id}/edit">
                    <SvgIcon icon="edit" color="var(--color-dw-scooter)" size="16px" />
                    <span>{__('archive / edit')}</span>
                </a>
            </div>
            <div class="dropdown-item">
                <span on:click={handleDuplicateButtonClick} class="link">
                    <SvgIcon icon="duplicate" color="var(--color-dw-scooter)" size="16px" />
                    <span>{__('archive / duplicate')}</span>
                </span>
            </div>
            <div class="dropdown-item">
                <span on:click={handleDeleteButtonClick} class="link">
                    <SvgIcon icon="trash" color="var(--color-dw-scooter)" size="16px" />
                    <span>{__('archive / delete')}</span>
                </span>
            </div>
        </div>
    </Dropdown>
</div>
