# TemplateEditor

A component for editing templates, for example for tooltips or custom download filennames.

```html
<TemplateEditor
    variables="{variables}"
    bind:value="template" />

<script>
    import { TemplateEditor } from '@datawrapper/controls';
    // or import directly via
    // import TemplateEditor from '@datawrapper/controls/TemplateEditor.html';

    export default {
        components: { TemplateEditor },
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
