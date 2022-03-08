<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import truncate from '@datawrapper/shared/truncate';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let __;

    /**
     * the value. if multiple or folder is set, the value is
     * an array of File objects, otherwise it's the File object
     */
    export let value = null;

    $: fileName =
        value !== null
            ? multiple || folder
                ? value.length === 1
                    ? value[0].name
                    : multipleFilesLabel.replace('%n', value.length)
                : value.name
            : '';

    /**
     * UID for testing
     */
    export let uid = null;

    /**
     * provide additional class names, e.g. "is-primary is-large"
     */
    export let className = '';

    /**
     * button label
     */
    export let label = __('fileinput / choose-file');

    /**
     * provide a custom label to replace the default
     * "selected 4 files" text
     */
    export let multipleFilesLabel = __('fileinput / selected-n-files');

    /**
     * support uploading multiple files
     */
    export let multiple = null;

    /**
     * support uploading an entire folder
     */
    export let folder = null;

    /**
     * show the name of the selected file(s) next
     * to the button. for multiple/folder inputs this
     * shows the number of files selected
     */
    export let showInfo = true;

    /**
     * show the name of the selected file(s) next
     * to the button
     */
    export let accept = null;

    function handleChange(event) {
        value = multiple || folder ? Array.from(event.target.files) : event.target.files[0];
        dispatch('change', multiple || folder ? { files: value } : { file: value });
    }
</script>

<div data-uid={uid} class="file {className}" class:has-name={showInfo}>
    <label class="file-label">
        <input
            class="file-input"
            type="file"
            on:change={handleChange}
            {multiple}
            {accept}
            webkitdirectory={folder}
        />
        <span class="file-cta">
            <IconDisplay icon="cloud-upload" />
            <span class="file-label ml-2">{label}</span>
        </span>
        {#if showInfo}
            <span class="file-name">{truncate(fileName, 14, 8)}</span>
        {/if}
    </label>
</div>
