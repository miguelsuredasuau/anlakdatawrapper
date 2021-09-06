# ColorCategoryInput

The successor of our old "base color" control. Allows for setting custom colors for each category (= unique value of a text column).

```html
<ColorCategoryInput baseColor="#cccccc" palette="{['#a6cee3','#1f78b4','#b2df8a']}" values="{['A','A','B','C','D','D']}" bind:value />

<script>
    import ColorCategoryInput from '../ColorCategoryInput.html';

    // needs a theme palette
    import { Store } from 'svelte/store.js';
    const store = new Store({
        themeData: {
            colors: {
                palette: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99']
            }
        }
    });

    export default {
        components: { ColorCategoryInput },
        data() {
            return {
                value: {
                    map: { CDU: '#222222', SPD: '#dd0000' },
                    categoryOrder: ['CDU', 'SPD'],
                    categoryLabels: { CDU: 'CDU/CSU' }
                }
            };
        },
        store: () => store
    };
</script>
```
