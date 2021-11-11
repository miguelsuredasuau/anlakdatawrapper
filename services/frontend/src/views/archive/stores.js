import { writable } from 'svelte/store';

const currentFolder = new writable({});

const dragNotification = new writable('');

const folderTreeDropZone = new writable();

const query = new writable({});

const selectedCharts = new writable(new Set([]));

const subfolderGridDropZone = new writable();

export {
    currentFolder,
    dragNotification,
    folderTreeDropZone,
    query,
    selectedCharts,
    subfolderGridDropZone
};
