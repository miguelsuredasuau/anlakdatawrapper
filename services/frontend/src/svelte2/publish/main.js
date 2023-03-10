/* eslint camelcase: "off" */
import App from './PublishSidebar.html';

import { Store } from 'svelte/store.js';
const store = new Store({});

const data = {
    chart: {
        id: ''
    },
    embedTemplates: [],
    pluginShareurls: [],
    published: false,
    publishing: false,
    needs_republish: false,
    publish_error: false,
    auto_publish: false,
    progress: [],
    shareurlType: 'default',
    embedType: 'responsive'
};

export default { App, data, store };
