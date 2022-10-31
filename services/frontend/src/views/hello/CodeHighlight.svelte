<script>
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import atomOneDark from 'svelte-highlight/styles/atom-one-dark';
    import hljs from 'highlight.js/lib/core';
    import xml from 'highlight.js/lib/languages/xml';
    import javascript from 'highlight.js/lib/languages/javascript';
    import css from 'highlight.js/lib/languages/css';

    hljs.registerLanguage('xml', xml);
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('css', css);

    export let code;
    $: highlighted = hljs.highlightAuto(code).value;
</script>

<svelte:head>
    {@html purifyHtml(atomOneDark, '<style>')}
</svelte:head>

<pre class="p-1" data-language="html"><code class="hljs"
        >{@html purifyHtml(highlighted, '<span>')}</code
    ></pre>
