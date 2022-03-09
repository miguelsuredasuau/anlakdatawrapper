<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
</script>

<div class="section pl-0 pt-0">
    <h3 id="bulma" class="title is-3">Other Bulma components</h3>
    <h4 class="subtitle is-4">Buttons</h4>

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
            ><span class="icon"><IconDisplay icon="arrow-left" /></span><span>Back</span></button
        >
        <button class="button is-primary"
            ><span>Proceed</span>
            <span class="icon"><IconDisplay icon="arrow-right" /></span></button
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

    <h4 class="subtitle is-4">Breadcrumb</h4>
    <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
            <li><a href="#/link">My Charts</a></li>
            <li><a href="#/link">Folder xyz</a></li>
            <li class="is-active"><a href="#/link">Folder 123</a></li>
        </ul>
    </nav>

    <h4 id="progress" class="subtitle is-4">Progress bar</h4>

    <progress class="progress is-primary" value="15" max="100">15%</progress>
    <progress class="progress is-info is-small" value="45" max="100">45%</progress>
    <progress class="progress is-success" value="60" max="100">60%</progress>
    <progress class="progress is-warning" value="75" max="100">75%</progress>
    <progress class="progress is-danger" max="100">90%</progress>
</div>
