<script>
    import CheckboxInput from '../_partials/controls/CheckboxInput.svelte';
    import Dropdown from '../_partials/components/Dropdown.svelte';
    import SvgIcon from '../layout/partials/SvgIcon.svelte';
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    import truncate from '@datawrapper/shared/truncate';
    import range from 'lodash/range';
    import { getContext } from 'svelte';
    import { selectedCharts, query } from './stores';

    const config = getContext('config');
    const { dayjs } = getContext('libraries');
    const { deleteChart, duplicateChart, openChart } = getContext('page/archive');
    const { handleDragStart } = getContext('page/archive/drag-and-drop');

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

    let dragPreview;
    let dragPreviewVisible = false;

    function handleVisualizationDragStart(event) {
        dragPreviewVisible = true;
        event.dataTransfer.setDragImage(dragPreview, 0, 0);
        event.dataTransfer.dropEffect = 'move';
        const selection = $selectedCharts && $selectedCharts.size ? [...$selectedCharts] : [chart];
        handleDragStart('charts', selection);
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

    .drag-preview-outer {
        opacity: 0;
        position: absolute;
        left: -1000px;
        top: -1000px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
        &.visible {
            opacity: 1;
        }
    }
    .drag-preview {
        position: absolute;
        left: 0;
        top: 0;
        width: 290px;
        border: 2px solid $dw-scooter-light;
        height: 78px;
        overflow: hidden;

        img {
            margin-bottom: -5px;
        }
    }
</style>

<div
    class="box has-border"
    class:selected
    draggable="true"
    on:dragstart|stopPropagation={handleVisualizationDragStart}
    on:dragend={() => (dragPreviewVisible = false)}
>
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

<div class="drag-preview-outer" class:visible={dragPreviewVisible} bind:this={dragPreview}>
    <div class="drag-preview box">
        <div class="columns">
            <div class="column is-one-third"><img alt="preview" src={thumbnail} /></div>
            <div class="column"><b>{truncate(purifyHTML(chart.title, ''), 40, 5)}</b></div>
        </div>
    </div>
    {#if $selectedCharts && $selectedCharts.size > 1}
        {#each range(1, Math.min(5, $selectedCharts.size)) as i}
            <div
                class="drag-preview box"
                style="left:{i * 4}px;top:{i * 4}px;z-index:{-i};opacity:{Math.pow(1 / i, 0.5)}"
            />
        {/each}
    {/if}
</div>
