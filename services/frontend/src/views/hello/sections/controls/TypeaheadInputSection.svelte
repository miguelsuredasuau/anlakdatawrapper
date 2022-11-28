<script type="text/javascript">
    import { onMount } from 'svelte';
    import TypeaheadInput from '_partials/controls/TypeaheadInput.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import TypeaheadItemRenderer from './TypeaheadItemRenderer.svelte';
    import httpReq from '@datawrapper/shared/httpReq.js';
    import uniq from 'lodash/uniq';

    let countries = [];

    let value = { value: 'DE', label: 'Germany' };

    onMount(async () => {
        // load countries as test data
        countries = (
            await (
                await fetch(
                    'https://gist.githubusercontent.com/gka/9e0bc93488f3e51fa8ff442a34cc6429/raw/582464aa18b3f7ad31474bee45692a86b5dc4f38/countries.json'
                )
            ).json()
        ).map(({ code, name }) => ({ value: code, label: name }));
    });

    async function customSearch(query) {
        // imagine some http request here
        await wait(1000 + Math.random() * 2000);
        // return the items that match the query
        query = query.toLowerCase();
        return countries.filter(d => d.label.toLowerCase().includes(query));
    }

    function wait(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    let geocodingValue = null;
    async function geocoding(query) {
        const { results } = await httpReq.get(
            `/v3/utils/geocode?q=${encodeURIComponent(query)}&language=en-US`
        );
        return results.map(res => ({
            label: res.formatted,
            value: {
                geometry: res.geometry,
                components: res.components
            }
        }));
    }

    let knownTags = [
        { label: 'Line chart', value: 'd3-lines' },
        { label: 'Bar chart', value: 'd3-bars' },
        { label: 'Scatterplot', value: 'scatter' },
        { label: 'Choropleth map', value: 'd3-maps-choropleth' },
        { label: 'Symbol map', value: 'd3-maps-symbol' },
        { label: 'Area chart', value: 'd3-area' },
        { label: 'Pie chart', value: 'd3-pies' },
        { label: 'Locator map', value: 'locator-maps' }
    ];

    async function tagSearch(query) {
        const newTag = {
            value: query.toLowerCase(),
            isNew: true,
            origLabel: query,
            label: `Create new: ${query}`
        };
        const matches = knownTags.filter(d => d.label.toLowerCase().includes(query.toLowerCase()));
        const fullMatch = knownTags.find(d => d.label.toLowerCase() === query.toLowerCase());
        return [...(fullMatch ? [] : [newTag]), ...matches];
    }

    let selectedTags = knownTags.slice(0, 4);

    let currentTag;

    function addTagToList(event) {
        const item = event.detail;
        if (item.isNew) {
            item.label = item.origLabel;
            delete item.isNew;
            delete item.origLabel;
        }
        selectedTags = uniq([...selectedTags, item]);
        knownTags = uniq([...knownTags, item]);
        currentTag = null;
    }

    function removeTag(item) {
        selectedTags = selectedTags.filter(tag => tag.value !== item.value);
    }
</script>

<style></style>

<div class="section pl-0 pt-0">
    <h3 id="typeahead" class="title is-3">TypeaheadInput</h3>
    Selected item:
    <pre>{value ? JSON.stringify(value) : 'null'}</pre>
    <div class="columns mt-2">
        <div class="column">
            <p>default:</p>
            <TypeaheadInput options={countries} bind:value />
        </div>
        <div class="column">
            <p>with icon:</p>
            <TypeaheadInput options={countries} bind:value icon="search" />
        </div>
        <div class="column">
            <p>custom item renderer:</p>
            <TypeaheadInput
                options={countries}
                bind:value
                customItemRenderer={TypeaheadItemRenderer}
            />
        </div>
        <div class="column">
            <p>Really slow search demo:</p>
            <!-- note that we don't pass the options here -->
            <TypeaheadInput search={customSearch} />
        </div>
    </div>

    <div class="columns">
        <div class="column">
            <h4 class="subtitle is-4">Keywords autocomplete demo</h4>
            <TypeaheadInput
                search={tagSearch}
                placeholder="Add visualization type"
                bind:value={currentTag}
                on:select={addTagToList}
            />
            <div class="mt-2">
                {#each selectedTags as c}
                    <span class="tag mr-2 mb-2"
                        ><span>{c.label}</span>
                        <button
                            on:click={() => removeTag(c)}
                            class="button icon is-text p-0 has-text-danger"
                            ><IconDisplay className="has-text-danger" icon="trash" /></button
                        >
                    </span>
                {/each}
            </div>
        </div>
        <div class="column">
            <h4 class="subtitle is-4">Geocoding API demo</h4>
            <TypeaheadInput
                placeholder="Enter address"
                search={geocoding}
                icon="globe"
                bind:value={geocodingValue}
            />
            <pre style="white-space: pre-wrap; max-height:200px" class="mt-2">{geocodingValue
                    ? JSON.stringify(geocodingValue, null, 3)
                    : 'null'}
            </pre>
        </div>
    </div>
    <div class="select">
        <select>
            <option>Select dropdown</option>
            <option>With options</option>
        </select>
    </div>
</div>
