import { Store } from 'svelte/store.js';

export const simpleChart = new Store({
    title: 'This is a title',
    metadata: {
        describe: {
            'source-name': 'This is the source',
            'source-url': 'https://www.example.com',
            intro: 'This is the description',
            byline: 'Datawrapper GmbH'
        },
        visualize: {},
        annotate: {
            notes: 'Here are some notes'
        }
    }
});
