# Pagination

For switching between pages of a paginated list, typically generated based on an paginated API response.

-   The individual links of the navigation are generated based on the `limit`, `offset`, and `total` attributes.
-   The `url` attribute takes a function that generate the `href` attribute for each link (optional).
-   A `navigate` event is fired whenever a pagination link is clicked.

```html
<Pagination {limit} {offset} {total} {url} on:navigate="gotoPage(event)" />

<script>
    import { Pagination } from '@datawrapper/controls';
    // or import directly via
    // import Pagination from '@datawrapper/controls/Pagination.html';

    export default {
        components: { Pagination },

        data() {
            return {
                limit: 20, // number of items per page
                offset: 0, // number of items the current page offsets
                total: 500, // total number of items
                url: ({ limit, offset }) => `?limit=${limit}&offset=${offset}`
            };
        },

        methods: {
            gotoPage({ limit, offset }) {
                this.set({ limit, offset });
            }
        }
    };
</script>
```
