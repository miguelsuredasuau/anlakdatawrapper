<script>
    import HelpDisplay from './HelpDisplay.svelte';

    export let block = false;
    export let disabled = false;
    export let error = false;
    export let htmlFor = null;
    export let label = false;
    export let labelWidth = false;
    export let labelHelp = false;
    export let inline = false;
    export let help = false;
    export let helpClass = false;
    export let miniHelp = false;
    export let type = 'default';
    export let valign = 'baseline';
    export let uid;

    const finalLabelWidth = labelWidth || '100px';
    const labelStyle = block ? null : `width: ${finalLabelWidth}`;
    const controlsStyle = block ? null : `width: calc(100% - ${finalLabelWidth} - 32px)`;
    const miniHelpStyle = block || inline ? null : `padding-left: ${finalLabelWidth}`;
</script>

<style>
    .control-group {
        margin-right: 1em; /* Space for help icon */
    }
    p.mini-help-block {
        margin: 0 0 0 18px;
    }
    label.disabled {
        color: #999;
        cursor: default;
    }
    .controls {
        position: relative;
    }
    .control-group.label-middle > .controls {
        vertical-align: middle;
    }
    .control-group.label-middle > .control-label {
        vertical-align: middle;
    }
    .control-group.label-baseline > .controls {
        vertical-align: baseline;
    }
    .control-group.label-baseline > .control-label {
        vertical-align: baseline;
    }
    .control-group.label-top > .controls {
        vertical-align: top;
        position: relative;
        top: 2px;
    }
    .control-group.label-top > .control-label {
        vertical-align: top;
    }
    .control-group-block {
        margin-right: 0;
    }
    .control-group-block label {
        line-height: 2;
    }
    .control-group-block .controls {
        display: block;
    }
    .control-group-block :global(input[type='text']),
    .control-group-block :global(textarea) {
        width: 100%;
        box-sizing: border-box !important;
    }
    .control-group-block :global(input[type='text']) {
        height: 28px;
    }
    .control-group-block :global(.mini-help-block) {
        margin-left: 0 !important;
    }
    .error,
    .error :global(.mini-help) {
        color: #bd362f;
    }
    .error :global(input[type='text']),
    .error :global(textarea) {
        border-color: #bd362f;
    }
    .error :global(input[type='text']:focus),
    .error :global(textarea:focus) {
        border-color: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(189, 54, 47, 0.6) !important;
    }
</style>

{#if help && !block}
    <HelpDisplay {helpClass}>
        <div>
            {@html help}
        </div>
    </HelpDisplay>
{/if}

<div
    class="control-group vis-option-group vis-option-group-{type} label-{valign}"
    class:control-group-block={block}
    class:error
    data-uid={uid}
>
    {#if help && block}
        <HelpDisplay {helpClass}>
            <div>
                {@html help}
            </div>
        </HelpDisplay>
    {/if}
    {#if label}
        <label class="control-label" for={htmlFor} class:disabled style={labelStyle}>
            {@html label}
            {#if labelHelp}
                <p class="mini-help mt-1">
                    {@html labelHelp}
                </p>
            {/if}
        </label>
    {/if}
    <div class="controls" class:form-inline={inline} style={controlsStyle}>
        <slot />
    </div>
    {#if miniHelp}
        <p class="mini-help mt-1" class:type class:mini-help-block={!inline} style={miniHelpStyle}>
            {@html miniHelp}
        </p>
    {/if}
</div>
