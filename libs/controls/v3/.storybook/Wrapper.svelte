<script>
    /**
     * This is the editor markup in which we wrap every component in the storybook
     */

    // the component used in the story
    export let child;

    // the props inherited from the component's story
    export let props = {};
</script>

<style>
    .span4 {
        margin-right: 20px;
    }
</style>

<div class="container-fluid">
    <div class="dw-create-visualize chart-editor chart-editor-web">
        <div class="visconfig">
            <div class="vis-options form-horizontal">
                <div class="row">
                    <div class="span4">
                        <svelte:component this={child} {...props} />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
