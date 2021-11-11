import { writable } from 'svelte/store';

const currentFolder = new writable({});

const folderTreeDropZone = new writable();

const query = new writable({});

const selectedCharts = new writable(new Set([]));

const subfolderGridDropZone = new writable();

export { currentFolder, folderTreeDropZone, query, selectedCharts, subfolderGridDropZone };
