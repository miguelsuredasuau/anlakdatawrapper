<script>
    import Modal from '_partials/components/Modal.svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import { beforeUpdate, getContext } from 'svelte';
    import httpReq from '@datawrapper/shared/httpReq';

    const { openVisualization, loadCharts } = getContext('page/archive');
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

    async function duplicate() {
        const res = await httpReq.post(`/v3/charts/${chart.id}/copy`);
        window.open('/chart/' + res.id + '/visualize', '_blank');
        loadCharts(true);
    }

    async function deleteVis() {
        if (window.confirm('Do you really want to delete this visualization?')) {
            await httpReq.delete(`/v3/charts/${chart.id}`);
            close();
            loadCharts(true);
        }
    }
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    .kicker {
        font-size: 12px;
        text-transform: uppercase;
        font-weight: bold;
        margin-bottom: 0;
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
        <div class="box">
            <div class="columns">
                <div class="column has-background-white">
                    <div
                        class="preview p-5"
                        style={themeBgColors[chart.theme]
                            ? `background:${themeBgColors[chart.theme]}`
                            : ''}
                    >
                        <iframe title={chart.title} src="/preview/{chart.id}" />
                    </div>
                </div>
                <div class="column is-one-third has-background-white-bis py-6 pl-6">
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
                            {chart.author.email}
                        </div>
                        {#if chart.forkedFrom}
                            <div class="column">
                                <div class="kicker">{__('archive / modal / copied-from')}</div>
                                <a
                                    on:click|preventDefault={openVisualization(chart.forkedFrom)}
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
                            <span>{__('archive / modal / edit')}</span></a
                        >
                    </div>
                    <hr class="my-2" />
                    <div class="chart-actions">
                        <ul>
                            <li>
                                <button on:click={duplicate} class="button is-ghost is-medium"
                                    ><SvgIcon icon="duplicate" />
                                    <span>{__('archive / modal / dupllicate')}</span></button
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
                        </ul>

                        <hr class="my-2" />
                        <button
                            on:click={deleteVis}
                            class="button is-ghost is-medium has-text-danger"
                            ><SvgIcon icon="trash" />
                            <span>{__('archive / modal / delete')}</span></button
                        >
                    </div>
                </div>
            </div>
        </div>
    </Modal>
{/if}
