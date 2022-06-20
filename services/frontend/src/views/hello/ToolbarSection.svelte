<script>
    import Toolbar from '_partials/editor/Toolbar.svelte';
    import ToolbarArea from '_partials/editor/ToolbarArea.svelte';
    import ToolbarItem from '_partials/editor/ToolbarItem.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
</script>

<style>
    input.input {
        width: 10ex;
    }
</style>

<div class="section pl-0 pt-0">
    <h3 id="toolbar" class="title is-3">Toolbars</h3>

    <div class="block">
        <h4 class="title is-4">Toolbar with single area</h4>
        <Toolbar>
            <ToolbarArea title="Preview">
                <ToolbarItem title="Mode" tooltip="Inline tooltip"
                    ><div class="buttons has-addons">
                        <button class="button is-small">Web</button>
                        <button class="button is-small">Print</button>
                    </div></ToolbarItem
                >
                <ToolbarItem title="Size">
                    <div class="field is-grouped">
                        <div class="control">
                            <input class="input is-small size" type="number" placeholder="0" />
                        </div>
                        <div class="control">
                            <input class="input is-small size" type="number" placeholder="0" />
                        </div>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <button class="button is-small"><IconDisplay icon="circle" /></button>
                        </div>
                        <div class="control">
                            <button class="button is-small"><IconDisplay icon="circle" /></button>
                        </div>
                        <div class="control">
                            <button class="button is-small"><IconDisplay icon="circle" /></button>
                        </div>
                    </div>
                    <div slot="footer">This is the item footer</div>
                </ToolbarItem>
                <ToolbarItem title="Colorblind">
                    <div class="buttons has-addons">
                        <button class="button is-small">x</button>
                        <button class="button is-small">x</button>
                        <button class="button is-small">x</button>
                        <button class="button is-small">x</button>
                    </div>
                </ToolbarItem>
                <ToolbarItem title="Dark mode">
                    <svelte:fragment slot="tooltip">
                        This is an <b>HTML</b> tooltip in a slot
                    </svelte:fragment>
                    <div class="buttons has-addons">
                        <button class="button is-small is-active">
                            <IconDisplay icon="sun" color="var(--color-dw-orange)" />
                        </button>
                        <button id="dark-mode" class="button is-small">
                            <IconDisplay icon="moon" color="var(--color-dw-grey)" />
                        </button>
                    </div>
                </ToolbarItem>
            </ToolbarArea>
        </Toolbar>
    </div>
    <div class="block">
        <h4 class="title is-4">Toolbar with multiple areas and footer</h4>
        <Toolbar>
            <ToolbarArea title="Adjust map">
                <ToolbarItem title="Size">Foo</ToolbarItem>
                <ToolbarItem title="Colorblind">Foo</ToolbarItem>
                <ToolbarItem title="Dark mode">Foo</ToolbarItem>
                <p slot="footer" class="has-text-grey mt-1">
                    <b>Scroll map</b> to zoom in/out<br />
                    <b>Shift + drag</b> to zoom to a selected area<br />
                    <b>Ctrl + drag</b> to rotate and tilt the map view
                </p>
            </ToolbarArea>
            <ToolbarArea title="Preview">
                <ToolbarItem title="Size">Foo</ToolbarItem>
                <ToolbarItem title="Colorblind">Foo</ToolbarItem>
                <ToolbarItem title="Dark mode">Foo</ToolbarItem>
            </ToolbarArea>
        </Toolbar>
    </div>
</div>
