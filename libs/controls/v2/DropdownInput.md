# DropdownInput

The DropdownInput component is for generic click-to-open dropdown dialogs. It is used by the [Dropdown] and [ColorPickerInput] components. Its main task is to make sure that all dropdowns are closed as soon as the page or another dropdown is being clicked, but stay open if the the user clicks anywhere _inside_ the dropdown.

```html
<DropdownInput width="50ex" bind:visible="open">
    <div slot="button">
        <button class="btn" class:btn-primary="!open">
            Custom dropdown button
        </button>
    </div>
    <div slot="content">
        <p>Custom dropdown content</p>
    </div>
</DropdownInput>

<script>
    import DropdownInput from '../DropdownInput.html';

    export default {
        components: { DropdownInput },
        data() {
            return { open: false };
        },
        computed: {}
    };
</script>
```
