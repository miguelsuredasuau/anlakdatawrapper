<script>
    import Menu from '_partials/Menu.svelte';
</script>

<div class="section pl-0 pt-0">
    <h3 id="menu" class="title is-3">Menu</h3>
    <div class="columns">
        <div class="column is-one-third">
            <Menu
                groups={[
                    {
                        title: 'Group A',
                        items: [
                            { url: 'vis', title: 'Chart type' },
                            { url: '/v2/hello', title: 'Refine' }
                        ]
                    },
                    {
                        title: 'Group B',
                        items: [
                            { url: 'vis', title: 'Chart type' },
                            { url: 'refine', title: 'Refine' }
                        ]
                    }
                ]}
            />
        </div>
    </div>
</div>
