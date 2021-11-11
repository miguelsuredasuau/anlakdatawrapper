<script>
    import CheckboxInput from '../_partials/controls/CheckboxInput.svelte';
    import Dropdown from '../_partials/components/Dropdown.svelte';
    import SvgIcon from '../layout/partials/SvgIcon.svelte';
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    import { getContext } from 'svelte';
    import { selectedCharts, query } from './stores';

    const config = getContext('config');
    const { dayjs } = getContext('libraries');
    const { deleteChart, duplicateChart, openChart } = getContext('page/archive');

    export let chart;
    export let __;
    $: sortField = $query.orderBy;

    let isDropdownActive = false;

    $: selected = $selectedCharts.has(chart);
    $: dateLine =
        sortField === 'publishedAt'
            ? chart.publishedAt
                ? `${__('dashboard / visualization / published')} ${dayjs(
                      chart.publishedAt
                  ).fromNow()}`
                : __('dashboard / visualization / not-published')
            : sortField === 'createdAt'
            ? `${__('dashboard / visualization / created')} ${dayjs(chart.createdAt).fromNow()}`
            : `${__('dashboard / visualization / last-edited')} ${dayjs(
                  chart.lastModifiedAt
              ).fromNow()}`;
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
        height: 100%;
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
        .viz {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            padding: 15px;
            padding-bottom: 5px;
            background: $dw-white;
        }
        .title {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        img {
            position: relative;
        }
        // hide broken thumbnail if image doesn't load
        img::after {
            content: '';
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background: #ffffff;
        }
        .box-checkbox {
            display: none;
            position: absolute;
            left: 3px;
            top: 3px;
            padding: 5px;
            border-radius: 4px;
            line-height: 1;
            box-sizing: content-box;

            :global(.css-ui) {
                background: white;
            }
        }
        &:hover .box-checkbox {
            display: block;
            background-color: $dw-grey-lightest;
        }
        &.selected .box-checkbox {
            display: block;
        }
        &.selected:hover .box-checkbox {
            background-color: $dw-scooter-lightest;
        }
        :global(.dropdown) {
            position: absolute;
            top: 0;
            right: 0;
        }
        .context-menu-button {
            display: block;
            opacity: 0;
            width: 28px;
            height: 26px;
            background-color: $dw-grey-lightest;
            border-radius: 4px;
            cursor: pointer;
            color: $dw-grey-dark;
        }
        &:hover .context-menu-button {
            opacity: 1;
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
    }
</style>

<div class="box has-border" class:selected>
    <a on:click|preventDefault={() => openChart(chart)} href="/chart/{chart.id}/edit" class="viz">
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
            <a class="dropdown-item" href="/chart/{chart.id}/edit">
                <SvgIcon icon="edit" />
                <span>{__('archive / edit')}</span>
            </a>
            <a
                class="dropdown-item"
                on:click|preventDefault={handleDuplicateButtonClick}
                href="#/duplicate"
            >
                <SvgIcon icon="duplicate" />
                <span>{__('archive / duplicate')}</span>
            </a>
            <a
                class="dropdown-item"
                on:click|preventDefault={handleDeleteButtonClick}
                href="#/delete"
            >
                <SvgIcon icon="trash" />
                <span>{__('archive / delete')}</span>
            </a>
        </div>
    </Dropdown>
</div>
