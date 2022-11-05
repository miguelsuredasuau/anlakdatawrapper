<script>
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import snarkdown from 'snarkdown';

    export let __;
    export let value;

    export let ariaLabel = null;
    export let style = null;
    export let uid = null;
    export let disabled = false;
    export let readonly = false;

    /**
     * optional checked state, e.g. to indicate that a change
     * has been saved
     */
    export let checked = false;

    /**
     * to indicate that the text input is waiting for some
     * server response etc.
     */
    export let loading = false;

    const ALLOWED_TAGS = [
        'a',
        'abbr',
        'address',
        'b',
        'big',
        'blockquote',
        'br',
        'caption',
        'cite',
        'code',
        'col',
        'colgroup',
        'dd',
        'del',
        'details',
        'dfn',
        'div',
        'dl',
        'dt',
        'em',
        'figure',
        'font',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'hr',
        'hgroup',
        'i',
        'img',
        'ins',
        'kbd',
        'li',
        'mark',
        'meter',
        'ol',
        'p',
        'pre',
        'q',
        's',
        'small',
        'span',
        'strike',
        'strong',
        'sub',
        'summary',
        'sup',
        'table',
        'tbody',
        'td',
        'th',
        'thead',
        'tfoot',
        'tr',
        'tt',
        'u',
        'ul',
        'wbr'
    ];

    export let allowedTags = ALLOWED_TAGS;

    $: html = snarkdown(value);
    let opened = true;
    let refTextarea;

    function showPreview() {
        if (readonly || disabled) return;
        opened = true;
    }

    function hidePreview() {
        if (readonly || disabled) return;
        opened = false;
    }
</script>

<style>
</style>

<div
    class="control mb-2"
    style="position: relative"
    class:is-loading={loading}
    class:has-icons-right={loading || checked}
    on:input
    data-uid={uid}
>
    <textarea
        bind:this={refTextarea}
        bind:value
        aria-label={ariaLabel}
        class="textarea"
        placeholder={__('editor / notes / placeholder', 'river')}
        {style}
        {disabled}
        {readonly}
        on:focus={hidePreview}
        on:blur={showPreview}
    />
    {#if !loading && checked}
        <IconDisplay icon="checkmark-bold" className="is-right" />
    {/if}
    {#if opened && value}
        <div
            class="textarea content"
            disabled={disabled ? 'disabled' : null}
            readonly={readonly ? 'readonly' : null}
            style="position: absolute; left: 0; top: 0; height: 100%; overflow-y:auto;"
            on:click={() => refTextarea.focus()}
        >
            {@html purifyHtml(html, allowedTags)}
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
