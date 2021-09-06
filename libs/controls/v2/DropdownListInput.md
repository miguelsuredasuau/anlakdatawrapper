# DropdownListInput

A simple dropdown menu.

```html
<script>
    export default {
        /* ... */
        helpers: {
            items: [
                {
                    label: 'Hello',
                    action() {
                        console.log('Hello world!');
                    }
                },
                {
                    label: 'Alert!',
                    disabled: true,
                    action() {
                        alert('This will never execute, because disabled is set to true');
                    }
                }
            ]
        }
    };
</script>

<DropdownListInput label="Your options" items="{items}" />
```
