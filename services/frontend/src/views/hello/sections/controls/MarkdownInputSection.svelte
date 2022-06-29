<script>
    import MarkdownInput from '_partials/controls/MarkdownInput.svelte';
    import { getContext } from 'svelte';

    const msg = getContext('messages');
    function createTranslate(msg, messages) {
        return (key, scope = 'core') => msg.translate(key, scope, messages);
    }
    $: __ = createTranslate(msg, $msg);

    let value = 'Hello, this is **markdown**!\n\n- This is\n- a list';
</script>

<div class="section pl-0 pt-0">
    <h3 id="markdown-input" class="title is-3">Markdown Input</h3>

    <div class="columns">
        <div class="column is-half">
            <h5 class="title is-4 mb-1 mt-4">normal</h5>
            <MarkdownInput {__} bind:value aria-label="My label" style="height: 10em">
                SLOT
            </MarkdownInput>

            <h5 class="title is-4 mb-1 mt-4">checked</h5>
            <MarkdownInput checked {__} bind:value aria-label="My label" style="height: 10em" />

            <h5 class="title is-4 mb-1 mt-4">loading</h5>
            <MarkdownInput loading {__} bind:value aria-label="My label" style="height: 10em" />

            <h5 class="title is-4 mb-1 mt-4">disabled</h5>
            <MarkdownInput disabled {__} bind:value aria-label="My label" style="height: 10em" />

            <h5 class="title is-4 mb-1 mt-4">readonly</h5>
            <MarkdownInput readonly {__} bind:value aria-label="My label" style="height: 10em" />
        </div>
    </div>
</div>
