<script>
    import { onMount } from 'svelte';
    import { omit } from 'lodash';

    export let value;
    let _value = value;

    export let width = '100%';
    export let height = '400px';

    export let mimeType = 'plain/text';

    const defaultOptions = {
        lineWrapping: true,
        matchBrackets: true,
        placeholder: '',
        lineNumbers: true,
        readOnly: false,
        foldGutter: true,
        search: true,
        lint: true
    };

    export let options = {};

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
        if (opts.foldGutter) opts.gutters.push('CodeMirror-foldgutter');
        if (opts.lint) opts.gutters.push('CodeMirror-lint-markers');

        return opts;
    }

    onMount(async () => {
        const opts = getCodeMirrorOptions();

        // Dynamically load CodeMirror at runtime:
        const CodeMirror = await import('/lib/codemirror/lib/codemirror');

        await import('/lib/codemirror/mode/javascript/javascript');
        await import('/lib/codemirror/mode/css/css');
        await import('/lib/codemirror/addon/edit/matchbrackets');
        await import('/lib/codemirror/addon/fold/foldgutter');
        await import('/lib/codemirror/addon/fold/brace-fold');

        if (opts.lint) {
            await import('/lib/jsonlint/jsonlint.js');
            await import('/lib/codemirror/addon/lint/json-lint');
            await import('/lib/codemirror/addon/lint/lint');
        }

        if (opts.search) {
            await import('/lib/codemirror/addon/search/search');
            await import('/lib/codemirror/addon/search/searchcursor');
            await import('/lib/codemirror/addon/search/jump-to-line');
        }

        // Initialize CodeMirror instance for each of the editors:
        codemirror = CodeMirror.fromTextArea(refTextArea, {
            mode: mimeType,
            ...omit(opts, ['search']),
            ...{
                readOnly
            }
        });

        if (width || height) {
            codemirror.setSize(width, height);
        }

        // keep value in sync with codemirror value changes
        codemirror.on('change', cm => (_value = value = cm.getValue()));
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
</script>

<style lang="scss">
    @import '../../../styles/export.scss';
    @import '/lib/codemirror/lib/codemirror.css';
    @import '/lib/codemirror/addon/fold/foldgutter.css';
    @import '/lib/codemirror/addon/dialog/dialog.css';
    @import '/lib/codemirror/addon/lint/lint.css';

    .editor :global(.CodeMirror) {
        font-size: $size-7;
        font-family: $family-monospace;
    }

    .editor {
        border: 1px solid $dw-grey-light;
        border-radius: $radius;
        overflow: hidden;
    }

    .editor textarea {
        opacity: 0;
    }

    .top-right {
        position: absolute;
        top: 20px;
        right: 30px;
    }
</style>

<div
    class="editor"
    class:is-relative={$$slots.topRight}
    class:readonly={readOnly}
    style={width && `width:${width}`}
>
    <textarea bind:this={refTextArea} style={height && `height:${height}`}>{value}</textarea>
    {#if $$slots.topRight}
        <div class="top-right">
            <slot name="topRight" />
        </div>
    {/if}
</div>
