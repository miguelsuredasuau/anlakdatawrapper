<script>
    import IconButton from '../IconButton.svelte';

    const assetURL = process.env.STORYBOOK_ICONS_URL;
</script>

<style>
    h3 {
        margin-top: 2em;
    }
    h3:first-child {
        margin-top: 0;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
    }
    li {
        margin-right: 5px;
    }
    .fixed-button-width li {
        width: 140px;
    }
    .equal-button-width li {
        width: 140px;
    }
</style>

<h3>Top icon alignment (default)</h3>
<ul>
    <li><IconButton {assetURL} title="Button text" icon="dw-chart" active /></li>
    <li><IconButton {assetURL} title="Click me" icon="link" /></li>
    <li><IconButton {assetURL} title="Another button action" icon="folder" /></li>
</ul>

<hr />

<h3>Left icon alignment</h3>

<ul>
    <li><IconButton {assetURL} title="Button text" icon="file-google" iconLeft active /></li>
    <li><IconButton {assetURL} title="Click me" icon="cloud-link" iconLeft /></li>
</ul>

<hr />

<h3>Left icon alignment: color override</h3>

<ul>
    <li><IconButton {assetURL} title="Button text" icon="file-google" iconLeft iconColor="#18a1cd" active /></li>
    <li><IconButton {assetURL} title="Click me" icon="cloud-link" iconLeft /></li>
</ul>

<hr />

<h3>Left icon alignment: equal buttons widths</h3>

<ul class="fixed-button-width">
    <li><IconButton {assetURL} title="Some fancy button text" icon="file-google" iconLeft active /></li>
    <li><IconButton {assetURL} title="Click me" icon="cloud-link" iconLeft /></li>
</ul>

<hr />

<h3>Left icon alignment: buttons of equal width + multi-line text</h3>

<ul class="equal-button-width">
    <li><IconButton {assetURL} title="One line" icon="file-google" iconLeft active /></li>
    <li><IconButton {assetURL} title="More than one line" icon="cloud-link" iconLeft /></li>
    <li><IconButton {assetURL} title="Even more lines in here" icon="copy-to-clipboard" iconLeft /></li>
</ul>
