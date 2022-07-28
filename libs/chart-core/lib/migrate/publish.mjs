import get from '@datawrapper/shared/get';
import set from '@datawrapper/shared/set';
import arrayToObject from '@datawrapper/shared/arrayToObject';

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
