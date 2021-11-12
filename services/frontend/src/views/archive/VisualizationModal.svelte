<script>
    import Modal from '_partials/components/Modal.svelte';
    import Dropdown from '_partials/components/Dropdown.svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import httpReq from '@datawrapper/shared/httpReq';
    import { beforeUpdate, getContext, tick } from 'svelte';

    const { deleteChart, duplicateChart, openChart } = getContext('page/archive');
    const { dayjs } = getContext('libraries');
    const { themeBgColors } = getContext('page/archive');

    export let __;
    export let open;
    export let chart;

    let _chart = chart;

    beforeUpdate(() => {
        if (chart !== _chart) {
            if (open) window.location.hash = `#/${chart.id}`;
            _chart = chart;
        }
    });

    function close() {
        open = false;
        window.history.replaceState(
            '',
            '',
            window.location.pathname + (window.location.search || '')
        );
    }

    let embedCodes;
    let selectedEmbedCode;
    let copyTextInput;

    async function loadEmbedCodes() {
        embedCodes = await httpReq.get(`/v3/charts/${chart.id}/embed-codes`);
    }

    async function handleDeleteButtonClick() {
        await deleteChart(chart);
        close();
    }

    async function copyEmbedCode(code) {
        selectedEmbedCode = code.code;
        await tick();
        copyTextInput.select();
        const copied = document.execCommand('copy');
        code.copied = copied;
        embedCodes = embedCodes;
        setTimeout(() => {
            code.copied = false;
            embedCodes = embedCodes;
        }, 5000);
    }
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    .kicker {
        font-size: 12px;
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 0;
        letter-spacing: 0.05em;
        color: $dw-grey-dark;
    }
    .kicker + h2 {
        margin-top: 0;
    }
    .button.close {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 20px;
    }

    .chart-actions :global(.icon) {
        font-size: 24px;
    }

    .preview {
        height: 100%;
        border-radius: var(--radius);
        iframe {
            width: 100%;
            height: 100%;
            border: 0;
            box-sizing: border-box;
        }
    }

    .button.edit-chart :global(.icon) {
        font-size: 28px;
        margin-left: -5px;
    }
</style>

{#if chart}
    <Modal bind:open on:close={close}>
        <div class="columns is-gapless has-background-white">
            <div class="column">
                <div
                    class="preview p-5"
                    style={themeBgColors[chart.theme]
                        ? `background:${themeBgColors[chart.theme]}`
                        : ''}
                >
                    <iframe title={chart.title} src="/preview/{chart.id}" />
                </div>
            </div>
            <div class="column is-one-third has-background-white-bis">
                <div class="block p-6">
                    <button on:click={close} class="button is-text close">
                        <SvgIcon icon="close" />
                    </button>
                    <div class="block">
                        <div class="kicker">{__('archive / modal / vis-id')}</div>
                        <h2 class="is-title is-size-2 has-text-weight-bold is-family-monospace">
                            {chart.id}
                        </h2>
                    </div>
                    <div class="block columns">
                        <div class="column">
                            <div class="kicker">{__('archive / modal / author')}</div>
                            {chart.author
                                ? chart.author.name || chart.author.email
                                : __('archive / modal / na')}
                        </div>
                        {#if chart.forkedFrom}
                            <div class="column">
                                <div class="kicker">{__('archive / modal / copied-from')}</div>
                                <a
                                    on:click|preventDefault={openChart(chart.forkedFrom)}
                                    href="#/{chart.forkedFrom}">{chart.forkedFrom}</a
                                >
                            </div>
                        {/if}
                    </div>
                    <div class="block columns">
                        <div class="column" title={dayjs(chart.createdAt).format('lll')}>
                            <div class="kicker">{__('archive / modal / created-at')}</div>
                            {dayjs(chart.createdAt).fromNow()}
                        </div>
                        <div class="column" title={dayjs(chart.publishedAt).format('lll')}>
                            <div class="kicker">{__('archive / modal / pubished-at')}</div>
                            {#if chart.publishedAt}
                                {dayjs(chart.publishedAt).fromNow()}
                            {:else}
                                <span class="has-text-grey">{__('archive / modal / na')}</span>
                            {/if}
                        </div>
                    </div>
                    <div class="block" title={dayjs(chart.lastModifiedAt).format('lll')}>
                        <div class="kicker">{__('archive / modal / last-edit')}</div>
                        {dayjs(chart.lastModifiedAt).fromNow()}
                    </div>
                    <div class="block">
                        <a
                            href="/chart/{chart.id}/edit"
                            class="edit-chart button is-primary is-large"
                            ><SvgIcon icon="edit" />
                            <span>{__('archive / edit')}</span></a
                        >
                    </div>
                    <hr class="my-2" />
                    <div class="chart-actions">
                        <ul>
                            <li>
                                <button
                                    on:click={() => duplicateChart(chart, true)}
                                    class="button is-ghost is-medium"
                                    ><SvgIcon icon="duplicate" />
                                    <span>{__('archive / duplicate')}</span></button
                                >
                            </li>
                            <li>
                                <a
                                    href="/chart/{chart.id}/publish"
                                    class="button is-ghost is-medium"
                                    ><SvgIcon icon="export-file" />
                                    <span>{__('archive / modal / re-publish')}</span></a
                                >
                            </li>
                            {#if chart.publishedAt}
                                <li>
                                    <Dropdown>
                                        <button
                                            slot="trigger"
                                            href="/chart/{chart.id}/publish"
                                            class="button is-ghost is-medium"
                                            ><SvgIcon icon="source-code" />
                                            <span>{__('archive / modal / copy-embed-code')}</span
                                            ><SvgIcon size="12px" icon="expand-down-bold" /></button
                                        >
                                        <div class="dropdown-content" slot="content">
                                            {#await loadEmbedCodes()}
                                                ...
                                            {:then}
                                                {#each embedCodes as code, i}
                                                    <a
                                                        on:click|preventDefault={() => {
                                                            copyEmbedCode(code, i);
                                                        }}
                                                        href="#/{code.id}"
                                                        class="dropdown-item"
                                                        >{code.title}{#if code.copied}<div
                                                                class="has-text-success is-size-7 mt-1 has-text-weight-bold"
                                                            >
                                                                {__(
                                                                    'archive / modal / copy-success'
                                                                )}
                                                            </div>{/if}</a
                                                    >
                                                {/each}
                                            {/await}
                                            <input
                                                style="position:absolute;top:-10000px"
                                                bind:this={copyTextInput}
                                                type="text"
                                                bind:value={selectedEmbedCode}
                                            />
                                        </div>
                                    </Dropdown>
                                </li>
                            {/if}
                        </ul>

                        <hr class="my-2" />
                        <button
                            on:click={handleDeleteButtonClick}
                            class="button is-ghost is-medium has-text-danger"
                            ><SvgIcon icon="trash" />
                            <span>{__('archive / delete')}</span></button
                        >
                    </div>
                </div>
            </div>
        </div>
    </Modal>
{/if}
