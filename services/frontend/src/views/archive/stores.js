import { writable } from 'svelte/store';

const currentFolder = new writable({});

const searchQuery = new writable('');

const selectedCharts = new writable(new Set());

export { currentFolder, searchQuery, selectedCharts };
