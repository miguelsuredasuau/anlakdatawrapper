<script>
    import { onMount } from 'svelte';
    import { omit } from 'lodash';
    import chroma from 'chroma-js';

    export let value;
    let _value = value;

    export let id = '';
    export let width = '100%';
    export let height = '400px';
    export let mode = 'plain/text';
    export let error = false;

    /**
     * highlight css colors in editor content
     */
    export let highlightColors = false;

    const defaultOptions = {
        lineWrapping: true,
        matchBrackets: true,
        placeholder: '',
        lineNumbers: true,
        readOnly: false,
        foldGutter: true,
        search: true,
        lint: true,
        autoCloseBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        keyMap: 'sublime',
        hintOptions: undefined
    };

    export let options = {};

    export let simpleMode = null;

    /**
     * codemirror API needs the textarea reference
     */
    let refTextArea;

    /**
     * CodeMirror instance
     */
    export let codemirror;

    export let readOnly = false;
    let _readOnly = readOnly;

    function getCodeMirrorOptions() {
        const opts = { ...defaultOptions, ...options };
        opts.gutters = [];

        if (opts.lineNumbers) opts.gutters.push('CodeMirror-linenumbers');
        if (opts.lint) opts.gutters.push('CodeMirror-lint-markers');
        if (opts.foldGutter) {
            opts.gutters.push('CodeMirror-foldgutter');
            opts.extraKeys = {
                ...(opts.extraKeys || {}),
                'Ctrl-Q': cm => cm.foldCode(cm.getCursor())
            };
        }

        return opts;
    }

    let CodeMirror;
    onMount(async () => {
        const opts = getCodeMirrorOptions();

        // Dynamically load CodeMirror at runtime:
        CodeMirror = await import('codemirror/lib/codemirror');

        await import('codemirror/mode/javascript/javascript');
        await import('codemirror/mode/css/css');
        await import('codemirror/addon/search/searchcursor');
        await import('codemirror/addon/comment/comment');
        await import(`codemirror/keymap/sublime`);

        if (opts.foldGutter) {
            await import('codemirror/addon/fold/foldgutter');
            await import('codemirror/addon/fold/brace-fold');
        }

        if (opts.lint) {
            window.jsonlint = await import('jsonlint-mod');
            await import('codemirror/addon/lint/json-lint');
            await import('codemirror/addon/lint/lint');
        }

        if (opts.search) {
            await import('codemirror/addon/search/search');
            await import('codemirror/addon/search/jump-to-line');
        }

        if (opts.matchBrackets) {
            await import('codemirror/addon/edit/matchbrackets');
        }

        if (opts.autoCloseBrackets) {
            await import('codemirror/addon/edit/closebrackets');
        }

        if (opts.hintOptions) {
            await import('codemirror/addon/hint/show-hint');
        }

        if (opts.placeholder) {
            await import('codemirror/addon/display/placeholder');
        }

        // Initialize CodeMirror instance for each of the editors:
        codemirror = CodeMirror.fromTextArea(refTextArea, {
            mode,
            ...omit(opts, ['search']),
            readOnly,
            keyMap: 'sublime'
        });

        if (width || height) {
            codemirror.setSize(width, height);
        }

        // keep value in sync with codemirror value changes
        codemirror.on('change', cm => (_value = value = cm.getValue()));

        const COLOR =
            /"?(#([a-z0-9]{8}|[a-z0-9]{6}|[a-z0-9]{3})|((rgb|hsl)a?\(\s*(-?\d+)(\.\d+)?%?,\s*(-?\d+)(\.\d+)?%?\s*,\s*(-?\d+)(\.\d+)?%?\s*(,\s*(-?\d+)(\.\d+)?%?)?\)))"?/i;

        codemirror.on('update', () => {
            if (highlightColors) {
                for (const el of refTextArea.parentNode.querySelectorAll('.cm-string,.cm-atom')) {
                    if (COLOR.test(el.innerHTML)) {
                        const color = el.innerHTML.replace(/"/g, '');
                        if (chroma.valid(color)) {
                            el.style.background = color;
                            const col = chroma(color);
                            el.style.color =
                                col.get('lab.l') < 60 && col.alpha() > 0.3 ? 'white' : 'black';
                        }
                    }
                }
            }
        });
    });

    $: {
        // keep codemirror value in sync with external data
        if (_value !== value) {
            if (codemirror) codemirror.setValue(value);
            _value = value;
        }
    }

    $: {
        // keep codemirror readOnly in sync with external data
        if (_readOnly !== readOnly) {
            if (codemirror) {
                codemirror.setOption('readOnly', readOnly);
                if (!readOnly) {
                    codemirror.focus();
                }
            }
            _readOnly = readOnly;
        }
    }
    $: if (codemirror) setSimpleMode(simpleMode);

    export async function setSimpleMode(mode) {
        if (!mode) return;
        await import('codemirror/addon/mode/simple');
        // we need to use default here otherwise the function is not defined somehow
        CodeMirror.default.defineSimpleMode('simplemode', mode);
        codemirror.setOption('mode', 'simplemode');
    }
</script>

<style lang="scss">
    @import '../../../styles/export.scss';
    @import '/lib/codemirror/lib/codemirror.css';
    @import '/lib/codemirror/addon/fold/foldgutter.css';
    @import '/lib/codemirror/addon/dialog/dialog.css';
    @import '/lib/codemirror/addon/lint/lint.css';
    @import '/lib/codemirror/addon/hint/show-hint.css';

    .editor {
        :global(.CodeMirror) {
            font-size: $size-7;
            font-family: $family-monospace;
            border: 1px solid var(--cm-border-color, $dw-grey-light);
            border-radius: $radius;
            overflow: hidden;
        }

        :global(.CodeMirror.CodeMirror-focused) {
            border-color: var(--cm-focus-border-color, #1d81a2);
            box-shadow: 0 0 0 0.125em rgba(29, 129, 162, 0.25);
        }

        :global(.CodeMirror-nonmatchingbracket) {
            color: inherit;
            background: var(--cm-nonmatchingbracket-background, inherit);
        }

        :global(.CodeMirror-matchingbracket) {
            color: inherit;
            background: var(--cm-matchingbracket-background, inherit);
        }
        :global(.cm-s-default) {
            color: var(--cm-default-color, inherit);
        }
        :global(.cm-comment) {
            color: var(--cm-comment-color, inherit);
        }
        :global(.cm-variable) {
            color: var(--cm-variable-color, inherit);
        }
        :global(.cm-variable-2) {
            color: var(--cm-variable-2-color, inherit);
        }
        :global(.CodeMirror-placeholder) {
            color: var(--cm-placeholder-color, inherit);
        }
        textarea {
            opacity: 0;
        }

        .top-right {
            position: absolute;
            top: 20px;
            right: 30px;
        }
    }

    .editor.is-danger {
        :global(.CodeMirror) {
            border: 1px solid var(--cm-error-border-color, #cf4870);
        }

        :global(.CodeMirror.CodeMirror-focused) {
            box-shadow: 0 0 0 0.125em rgba(207, 72, 112, 0.25);
        }
    }
</style>

<div
    class="editor"
    class:is-danger={error}
    class:is-relative={$$slots.topRight}
    class:readonly={readOnly}
    style={width && `width:${width}`}
>
    <!-- Pseudo textarea that we use for focusing -->
    <textarea {id} style="position: absolute" on:focus={() => codemirror?.focus()} />
    <textarea bind:this={refTextArea} class="textarea" style={height && `height:${height}`}
        >{value}</textarea
    >
    {#if $$slots.topRight}
        <div class="top-right">
            <slot name="topRight" />
        </div>
    {/if}
</div>
