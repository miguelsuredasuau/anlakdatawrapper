<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    export let color;
    export let className;
</script>

<IconDisplay
    valign="sub"
    icon="loading-spinner"
    timing="steps(12)"
    duration="1s"
    {color}
    {className}
    size="1.1rem"
    spin
/>
