# Simple table

For displaying tabluar data in a HTML table element, with optional sorting.

```html
<TableDisplay columnHeaders="{[{ title: 'City' }, { title: 'District' }]}">
    <tr>
        <td>Berlin</td>
        <td>Märkisches Viertel</td>
    </tr>
    <tr>
        <td>Eberswalde</td>
        <td>Brandenburgisches Viertel</td>
    </tr>
    <tr>
        <td>Stuttgart</td>
        <td>Hallschlag</td>
    </tr>
</TableDisplay>
```

Column headers can also be used to set the `width` of each column explicitly. This overrides the default behavior of the table.

Depending on the content you want to display in the table, you may need additional styling for the content to not interfere with column widths.

```html
<TableDisplay columnHeaders="{[{ title: 'City', width: '50%' }, { title: 'District', width: '50%'  }]}">
    <tr>
        <td>Berlin</td>
        <td>Märkisches Viertel</td>
    </tr>
    <tr>
        <td>Eberswalde</td>
        <td>Brandenburgisches Viertel</td>
    </tr>
    <tr>
        <td>Stuttgart</td>
        <td>Hallschlag</td>
    </tr>
</TableDisplay>
```

# TableDisplay table

The component does not make any assumptions about the data it is displaying. In order to use sorting, you'd need to implement the sorting functionality yourself. This may be implemented on the client-side, or as a feature of the API that provides the data.

Here's a simple example that uses client-side sorting:

```html
<TableDisplay {columnHeaders} on:sort="sort(event)" orderBy="0">
    {#each sortedData as row}
    <tr>
        {#each row as value}
        <td>{ value }</td>
        {/each}
    </tr>
    {/each}
</TableDisplay>

<script>
    import TableDisplay from '../TableDisplay.html';

    const columnHeaders = [
        {
            title: 'Character',
            orderBy: '0'
        },
        {
            title: 'Number',
            orderBy: '1'
        },
        {
            title: 'Fruit',
            orderBy: '2'
        }
    ];

    const data = [
        ['A', 9, 'Blackberry'],
        ['B', 8, 'Apple'],
        ['C', 7, 'Raspberry'],
        ['D', 6, 'Pear'],
        ['E', 5, 'Watermellon'],
        ['F', 4, 'Strawberry'],
        ['G', 3, 'Banana'],
        ['H', 2, 'Elderberry'],
        ['I', 1, 'Orange']
    ];

    export default {
        components: { TableDisplay: TableDisplay },

        data() {
            return {
                columnHeaders,
                data,
                orderBy: '0',
                order: 'ASC'
            };
        },

        computed: {
            sortedData: ({ data, orderBy, order }) =>
                data.sort((a, b) => {
                    const direction = order === 'ASC' ? 1 : -1;
                    const comparison = a[orderBy] > b[orderBy] ? 1 : -1;
                    return direction * comparison;
                })
        },

        methods: {
            sort({ orderBy, order }) {
                this.set({ orderBy, order });
            }
        }
    };
</script>
```
