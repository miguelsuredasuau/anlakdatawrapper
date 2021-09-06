# ListInput

A list of things that can be selected, multi-selected and drag-resorted. You can use a custom render component to change how the list items are displayed.

| Attribute         | Default    | Description                                                                                                            |
| ----------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `items`           | (empty)    | ListInput of items to be displayed in the list                                                                         |
| `itemRenderer`    | _ListItem_ | A Svelte component that renders the item                                                                               |
| `draggable`       | _false_    | Decides if list items can be drag-resorted                                                                             |
| `selectable`      | _true_     | Decides if list items can be selected                                                                                  |
| `multiselectable` | _true_     | Decides if multiple list items can be selected by ctrl-clicking or shift-clicking                                      |
| `deselectable`    | _false_    | If set to true, a single selected list item can be deselected using a normal click (otherwise only through ctrl+click) |
| `disabled`        | _false_    | If set to true, the entire ListInput will be disabled                                                                  |
| `compact`         | _false_    | If set to true, the ListInput will use a smaller font size and less padding                                            |
| `maxHeight`       | _220px_    | The max height of ListInput items (default for `compact` Lists is _120px_)                                             |
| `className`       | ""         | A custom class that can be added to the list                                                                           |
| `data`            | ""         | A custom data object that will be passed on to the list item components                                                |

```html
<ListInput
    items="{markers}"
    itemRenderer="{myRenderer}"
    className="String"
    draggable="{true|false}"
    selectable="{true|false}"
    compact="{true|false}"
    multiselectable="{true|false}"
    deselectable="{true|false}"
    disabled="{true|false}"
    data="{object}"
/>

<script>
    import { ListInput } from '@datawrapper/controls';
    // or import directly via
    // import ListInput from '@datawrapper/controls/ListInput.html';

    import CustomListItemRenderer from './CustomListItemRenderer.html';

    export default {
        components: { ListInput },
        data() {
            return {
                myRenderer: CustomListItemRenderer,
                markers: [
                    { id: 1, label: 'Foo' },
                    { id: 2, label: 'Bar' }
                    // ...
                ]
            };
        }
    };
</script>
```

&nbsp;

### Resorting of ListInput items

By default, list items can **not** be resorted using drag and drop. To enable this, set `draggable` to `true`.

```html
<ListInput draggable="{true}" />
```

To handle the drag guesture you can listen to the `itemDrag` event:

```html
<ListInput bind:items on:itemDrag="dragged(event)" />

<script>
    export default {
        data() {
            return {
                items: ['a', 'b', 'c']
            };
        },
        methods: {
            dragged({ items }) {
                console.log('items in new order', items);
            }
        }
    };
</script>
```

&nbsp;

### Default list item renderer

The default list item renderer is a simple `<div>` showing the item name.

```html
<div>
    {@html item.name || item.label || item.id}
</div>
```
