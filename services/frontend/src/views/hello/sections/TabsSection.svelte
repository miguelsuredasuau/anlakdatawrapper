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
            { id: 'layout', title: 'Layout' }
        ]}
        active="refine"
        className=""
    />

    with icon
    <Tabs
        items={[
            { id: 'vis', title: 'Chart type' },
            { id: 'refine', title: 'Refine' },
            { id: 'annotate', title: 'Annotate' },
            { id: 'layout', title: 'Layout', icon: 'info-circle' }
        ]}
        active="refine"
        className=""
    />

    <div class="columns">
        <div class="column is-4">
            colored icon:
            <Tabs
                items={[
                    { id: 'upload', title: 'Upload' },
                    { id: 'match', title: 'Match' },
                    {
                        id: 'check',
                        title: 'Check',
                        icon: 'checkmark-bold',
                        iconColor: 'var(--color-dw-green)'
                    }
                ]}
                active="upload"
                className=""
            />
        </div>
    </div>
</div>
