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
                    { label: 'Country Name', name: 'country_name', type: 'text' },
                    { label: 'Continent', name: 'continent', type: 'text' },
                    { label: 'Population', name: 'population', type: 'number' },
                    { label: 'Pop. density', name: 'pop_density', type: 'number' },
                    { label: 'Date', name: 'date', type: 'date' },
                ];
            }
        }
    }
</script>
```
