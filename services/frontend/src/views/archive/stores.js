import { writable } from 'svelte/store';

const currentFolder = new writable({});

const searchQuery = new writable('');

const selectedCharts = new writable(new Set());

const dragNotification = new writable('');

const folderTreeDropZone = new writable();
const subfolderGridDropZone = new writable();

export {
    currentFolder,
    searchQuery,
    selectedCharts,
    dragNotification,
    folderTreeDropZone,
    subfolderGridDropZone
};
