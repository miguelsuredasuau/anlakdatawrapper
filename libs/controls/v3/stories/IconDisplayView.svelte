<script>
    /* eslint-env node */
    import IconDisplay from '../IconDisplay.svelte';

    const assetURL = process.env.STORYBOOK_ICONS_URL;
</script>

<style>
    h4 {
        margin-top: 2em;
    }
    h4:first-child {
        margin-top: 0;
    }
    li {
        line-height: 2em;
    }
</style>

<h4>IconDisplay: defaults</h4>
<IconDisplay {assetURL} icon="new" />
<IconDisplay {assetURL} icon="rocket" />
<IconDisplay {assetURL} icon="typewriter" />
<IconDisplay {assetURL} icon="api" />
<IconDisplay {assetURL} icon="privacy" />

<h4>IconDisplay: custom color</h4>
<IconDisplay {assetURL} color="hotpink" icon="new" />
<IconDisplay {assetURL} color="green" icon="rocket" />
<IconDisplay {assetURL} color="#ff0000" icon="typewriter" />
<IconDisplay {assetURL} color="#0f7595" icon="api" />
<IconDisplay {assetURL} color="#666" icon="privacy" />

<h4>IconDisplay: custom size</h4>
<IconDisplay {assetURL} valign="middle" size="50px" icon="new" />
<IconDisplay {assetURL} valign="middle" size="2em" icon="rocket" />
<IconDisplay {assetURL} valign="middle" size="60px" icon="typewriter" />
<IconDisplay {assetURL} valign="middle" size="30px" icon="api" />
<IconDisplay {assetURL} valign="middle" size="1em" icon="privacy" />

<h4>IconDisplay: spinner (linear / steps / ease-in-out)</h4>
<IconDisplay {assetURL} size="40px" icon="new" spin />
<IconDisplay
    {assetURL}
    size="40px"
    icon="loading-spinner"
    spin
    timing="steps(12)"
    duration="1.5s"
/>
<IconDisplay {assetURL} size="40px" icon="refresh" spin timing="ease-in-out" duration="1s" />

<h4>IconDisplay: vertical alignment</h4>
<ul>
    <li>
        <code>baseline</code>:
        <IconDisplay {assetURL} size="20px" icon="new" valign="sub" />
    </li>
    <li>
        <code>middle</code>:
        <IconDisplay {assetURL} size="20px" icon="new" valign="middle" />
    </li>
    <li>
        <code>super</code>:
        <IconDisplay {assetURL} size="20px" icon="new" valign="super" />
    </li>
    <li>
        length (e.g. <code>-20%</code>):
        <IconDisplay {assetURL} size="20px" icon="new" valign="-20%" />
    </li>
</ul>

<h4>IconDisplay: use class names for custom layout</h4>
<p>(example: <code>pl-5 pt-5</code>)</p>
<div style="border: 1px solid #dadada; display: inline-block;">
    <IconDisplay {assetURL} icon="new" class="pl-5 pt-5" />
</div>
