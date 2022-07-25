/* eslint-env node */
import { readFileSync } from 'node:fs';
var locale = JSON.parse(readFileSync('./stories/static/locale.en.json', 'utf8'));

// Include translation strings:
global.dw = { backend: { __messages: { core: locale } } };
