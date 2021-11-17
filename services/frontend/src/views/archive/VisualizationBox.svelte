<script>
    import CheckboxInput from '../_partials/controls/CheckboxInput.svelte';
    import Dropdown from '../_partials/Dropdown.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import httpReq from '@datawrapper/shared/httpReq';
    import purifyHTML from '@datawrapper/shared/purifyHtml';
    import truncate from '@datawrapper/shared/truncate';
    import range from 'lodash/range';
    import { getContext, tick } from 'svelte';
    import { selectedCharts, query } from './stores';
    import { selectAll } from './shared';

    const config = getContext('config');
    const user = getContext('user');
    const { dayjs } = getContext('libraries');
    const { deleteChart, duplicateChart, openChart, teams } = getContext('page/archive');
    const { handleDragStart } = getContext('page/archive/drag-and-drop');

    export let chart;
    export let __;
    $: sortField = $query.orderBy;

    let isDropdownActive = false;
    let isTitleEditable = false;
    let chartTitle;

    $: displayLocale =
        $user.activeTeam && !!teams.find(t => t.id === $user.activeTeam.id).settings.displayLocale;

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
        chart.isDeleting = true;
        deleteChart(chart);
        isDropdownActive = false;
    }

    function handleRenameButtonClick() {
        toggleTitleEdit();
        isDropdownActive = false;
    }

    async function toggleTitleEdit() {
        await tick();
        isTitleEditable = !isTitleEditable;
        if (!isTitleEditable) {
            return;
        }
        selectAll(chartTitle);
        await tick();
        chartTitle.focus();
    }

    /*
     * runs when user is done editing the chart title
     * updates chart title via API
     */
    async function chartTitleBlur() {
        const newTitle = chartTitle.innerText.trim();
        isTitleEditable = false;
        if (newTitle !== chart.title) {
            try {
                await httpReq.patch(`/v3/charts/${chart.id}`, {
                    payload: {
                        title: newTitle
                    }
                });
                chart.title = newTitle;
                chart = chart;
            } catch (err) {
                window.alert(err);
            }
        }
    }

    /*
     * monitor key strokes while user edits a chart title
     * Return = save, Esc = reset
     */
    function chartTitleKeyUp(event) {
        if (event.key === 'Enter') {
            // enter pressed
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            chartTitle.blur();
        } else if (event.key === 'Esc' || event.key === 'Escape') {
            // Esc pressed, reset old folder name
            chartTitle.innerText = chart.title;
            chartTitle.blur();
        }
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
    @import 'bulma/sass/utilities/_all.sass';
    .box {
        position: relative;
        height: 100%;
        border: 1px solid $dw-grey-lighter;
        padding: 10px;
        box-shadow: none;
        margin-bottom: 0;
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
            &.title-editable {
                overflow: visible;
                white-space: normal;
            }
        }
        .thumb {
            width: 100%;
            padding-bottom: 75%;
            background-size: cover;
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
        .subline {
            line-height: 1.2;
        }

        &.is-deleting {
            opacity: 0.4;
            pointer-events: none;
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
        b {
            text-overflow: clip;
            outline: none;
        }
    }
    @include tablet {
        .box .viz {
            padding: 5px;
        }
    }
    @include fullhd {
        .box .viz {
            padding: 15px 15px 5px;
        }
    }
</style>

<div
    class="box has-border"
    class:selected
    class:is-deleting={chart.isDeleting}
    draggable="true"
    on:dragstart|stopPropagation={handleVisualizationDragStart}
    on:dragend={() => (dragPreviewVisible = false)}
>
    <a on:click|preventDefault={() => openChart(chart)} href="/chart/{chart.id}/edit" class="viz">
        <figure class="image is-4by3">
            <figcaption
                title={purifyHTML(chart.title, '')}
                class="title is-size-6 is-size-5-fullhd mb-3"
                bind:this={chartTitle}
                contentEditable={isTitleEditable}
                class:title-editable={isTitleEditable}
                on:keypress={chartTitleKeyUp}
                on:blur={chartTitleBlur}
            >
                {purifyHTML(chart.title, '')}
            </figcaption>
            <div class="thumb" style="background-image: url({thumbnail})" />
        </figure>
        <div class="subline columns is-variable is-1 mt-2 has-text-grey-dark is-size-7">
            {#if dateLine}
                <div class="column ">{dateLine}</div>
            {/if}
            {#if displayLocale}
                <div class="column is-narrow has-text-right">{chart.language}</div>
            {/if}
        </div>
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
            <IconDisplay icon="menu-vertical" size="18px" />
        </div>
        <div slot="content" class="dropdown-content">
            <a
                class="dropdown-item"
                on:click|preventDefault={handleRenameButtonClick}
                href="#/rename"
            >
                <IconDisplay icon="rename" />
                <span>{__('archive / folder / rename')}</span>
            </a>
            <a class="dropdown-item" href="/chart/{chart.id}/edit">
                <IconDisplay icon="edit" />
                <span>{__('archive / edit')}</span>
            </a>
            <a
                class="dropdown-item"
                on:click|preventDefault={handleDuplicateButtonClick}
                href="#/duplicate"
            >
                <IconDisplay icon="duplicate" />
                <span>{__('archive / duplicate')}</span>
            </a>
            <a
                class="dropdown-item"
                on:click|preventDefault={handleDeleteButtonClick}
                href="#/delete"
            >
                <IconDisplay icon="trash" />
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
