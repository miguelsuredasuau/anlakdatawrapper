<script>
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import snarkdown from 'snarkdown';

    export let __;
    export let value;

    export let ariaLabel = null;
    export let style = null;

    let html = snarkdown(value);
    let opened = true;
    let refTextarea;

    function showPreview() {
        html = snarkdown(value);
        opened = true;
    }

    function hidePreview() {
        opened = false;
    }
</script>

<div class="mb-2" style="position: relative" on:input>
    <textarea
        bind:this={refTextarea}
        bind:value
        aria-label={ariaLabel}
        class="textarea"
        placeholder={__('editor / notes / placeholder', 'river')}
        {style}
        on:focus={hidePreview}
        on:blur={showPreview}
    />
    {#if opened && value}
        <div
            class="textarea"
            style="position: absolute; left: 0; top: 0; height: 100%; overflow-y:auto;"
            on:click={refTextarea.focus()}
        >
            {@html purifyHtml(html)}
        </div>
    {/if}
</div>
<div class="is-flex is-justify-content-space-between">
    <small>
        <a
            href="https://daringfireball.net/projects/markdown/basics"
            target="_blank"
            rel="noreferrer noopener">{__('editor / markdown', 'river')}</a
        >
    </small>
    <slot />
</div>
