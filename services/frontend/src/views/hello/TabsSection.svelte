<script>
    import Tabs from '_partials/Tabs.svelte';
</script>

<div class="section pl-0 pt-0">
    <h3 class="title is-3" id="tabs">Tabs</h3>

    <Tabs
        items={[
            { id: 'vis', title: 'Chart type' },
            { id: 'refine', title: 'Refine' },
            { id: 'annotate', title: 'Annotate' },
            { id: 'design', title: 'Design' }
        ]}
        active="refine"
        className=""
    />
</div>
