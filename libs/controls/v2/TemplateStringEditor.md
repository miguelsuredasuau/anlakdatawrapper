# TemplateStringEditor

A component for editing template strings for example for custom download filennames or tooltips

```html
<TemplateStringEditor
    variables="{variables}"
    bind:value="template" />

<script>
    import { TemplateStringEditor } from '@datawrapper/controls';
    // or import directly via
    // import TemplateStringEditor from '@datawrapper/controls/TemplateStringEditor.html';

    export default {
        components: { TemplateStringEditor },
        data() {
            return {
                template: {
                    title: '',
                    body: ''
                },
                variables: [
                    { label: 'Country Name', name: 'country_name', value: 'germany', type: 'text' },
                    { label: 'Continent', name: 'continent', value: 'Europe', type: 'text' },
                    { label: 'Population', name: 'population', value: 80716000, type: 'number' },
                    { label: 'Pop. density', name: 'pop_density', value: 226, type: 'number' },
                    { label: 'Date', name: 'date', value: '2019-01-01', type: 'date' },
                ];
            }
        }
    }
</script>
```
