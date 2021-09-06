# TypeAheadInput

A typeahead control.

| Attribute     | Default | Discription                                                                                             |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `items`       | []      | List of items to be displayed in the list                                                               |
| `placeholder` | ""      | Placeholder text                                                                                        |
| `selection`   | (empty) | Binds the selected item label in the following order of importance: item.title, item.display, item.name |
| `query`       | ""      | The input text                                                                                          |
| `open`        | _false_ | If the typeahead is open or not                                                                         |

| Events      | Discription                                                                              |
| ----------- | ---------------------------------------------------------------------------------------- |
| `on:focus`  | An event which gets fired when typeahead is focused                                      |
| `on:search` | An event which gets fired when searching. The event object is the input text             |
| `on:select` | An event which gets fired when selecting an item. The event object is the selected item. |
| `on:hover`  | An event which gets fired when hovering over an item. The event object is the item.      |

```html
<TypeAheadInput
    items="{items}"
    placeholder="Placeholder text"
    selection="{selectedItemLabel}"
    bind:query="queryText"
    bind:open="{true|false}"
    filter="{filterItems}"
    on:focus="function()"
    on:search="function(queryText)"
    on:select="function(item)"
    on:hover="function(item)"
/>

<script>
    import { TypeAheadInput } from '@datawrapper/controls';
    // or import directly via
    // import TypeAheadInput from '@datawrapper/controls/TypeAheadInput.html';

    export default {
        components: { TypeAheadInput },
        data() {
            return {
                items: [
                    { "code": "AF", "name": "Afghanistan", "title": "Afghanistan", "display": "Afghanistan"},
                    { "code": "AX", "name": "Åland Islands", "title": "Åland Islands", "display": "Åland Islands" },
                    { "code": "AL", "name": "Albania", "title": "Albania", "display": "Albania" },
                    { "code": "DZ", "name": "Algeria", "title": "Algeria", "display": "Algeria" },
                    ...
                ]
            }
        }
    }
</script>
```
