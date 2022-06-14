<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import Dropdown from '_partials/Dropdown.svelte';
</script>

<div class="section pl-0 pt-0">
    <h3 id="dropdown" class="title is-3">Dropdown</h3>

    <Dropdown>
        <button aria-haspopup="true" aria-controls="dropdown-menu" class="button" slot="trigger">
            Open drop-down menu
        </button>
        <div class="dropdown-content" slot="content">
            <div class="dropdown-item">
                <p>
                    You can insert <strong>any type of content</strong> within the dropdown menu.
                </p>
            </div>
            <hr class="dropdown-divider" />
            <div class="dropdown-item">
                <p>
                    You simply need to use a <code>&lt;div&gt;</code> instead.
                </p>
            </div>
            <hr class="dropdown-divider" />
            <a href="#/link" class="dropdown-item"> This is a link </a>
        </div>
    </Dropdown>

    <Dropdown up>
        <button aria-haspopup="true" aria-controls="dropdown-menu" class="button" slot="trigger">
            Open drop-up menu
        </button>
        <div class="dropdown-content" slot="content">
            <div class="dropdown-item">
                <p>
                    You can insert <strong>any type of content</strong> within the dropdown menu.
                </p>
            </div>
        </div>
    </Dropdown>

    <Dropdown>
        <div slot="trigger">
            <IconDisplay size="1.5em" className="ml-2" icon="menu-vertical" />
        </div>
        <div class="dropdown-content" slot="content">
            <div class="dropdown-item">
                <p>
                    You can insert <strong>any type of content</strong> within the dropdown menu.
                </p>
            </div>
        </div>
    </Dropdown>
</div>
