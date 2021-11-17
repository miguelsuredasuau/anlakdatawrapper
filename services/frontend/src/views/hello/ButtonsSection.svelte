<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
</script>

<div class="section pl-0 pt-0">
    <h3 class="title is-3" id="buttons">Buttons</h3>

    <div class="buttons">
        <button class="button">Default</button>
        <button class="button is-white">White</button>
        <button class="button is-light">Light</button>
        <button class="button is-dark">Dark</button>
        <button class="button is-black">Black</button>
        <button class="button is-text">Text</button>
        <button class="button is-ghost">Ghost</button>
    </div>

    <div class="buttons">
        <button class="button is-primary">Primary</button>
        <button class="button is-primary" disabled>Disabled</button>
        <button class="button is-link">Link</button>
    </div>

    <div class="buttons has-addons">
        <button class="button is-light"
            ><span class="icon"><i class="fa fa-chevron-left fa-fw" /></span><span>Back</span
            ></button
        >
        <button class="button is-primary"
            ><span>Proceed</span>
            <span class="icon"><i class="fa fa-chevron-right fa-fw" /></span></button
        >
    </div>

    <div class="buttons">
        <button class="button is-info">Info</button>
        <button class="button is-success">Success</button>
        <button class="button is-warning">Warning</button>
        <button class="button is-danger">Danger</button>
    </div>

    <div class="buttons">
        <button class="button is-small is-light"
            ><span class="icon"><i class="fa fa-plus" /></span>
            <span>Add area fill</span></button
        >
        <button class="button"><IconDisplay icon="rocket" /> <span>Normal</span></button>
        <button class="button is-medium"><IconDisplay icon="rocket" /> <span>Medium</span></button>
        <button class="button is-large is-primary"
            ><IconDisplay icon="rocket" /> <span>Publish chart</span></button
        >
    </div>
</div>
