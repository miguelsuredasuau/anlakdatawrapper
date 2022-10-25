import get from '@datawrapper/shared/get.js';
import set from '@datawrapper/shared/set.js';
import arrayToObject from '@datawrapper/shared/arrayToObject.js';

export default [
    metadata => {
        set(metadata, 'publish', arrayToObject(get(metadata, 'publish', {})));
    },
    metadata => {
        const oldVal = get(metadata, 'publish.blocks.logo');
        if (typeof oldVal === 'boolean') {
            set(metadata, 'publish.blocks.logo', { enabled: oldVal });
        }
    }
];
