<script>
    import ViewComponent from '_partials/ViewComponent.svelte';

    export let __;
    export let themes;
    export let teamSettings;
    export let layoutControlsGroups = [];

    $: sharedProps = {
        __,
        themes,
        teamSettings
    };

    function byPriority(a, b) {
        return (
            (a.priority !== undefined ? a.priority : 999) -
            (b.priority !== undefined ? b.priority : 999)
        );
    }
</script>

{#each layoutControlsGroups as group}
    {#if group.controls.length > 0}
        {#if group.title}
            <h4 class="title is-4 mb-3">{__(group.title)}</h4>
        {/if}
        <div class="block">
            {#each group.controls.sort(byPriority) as ctrl}
                <ViewComponent {__} id={ctrl.component} props={{ ...sharedProps, ...ctrl.props }} />
            {/each}
        </div>
    {/if}
{/each}
