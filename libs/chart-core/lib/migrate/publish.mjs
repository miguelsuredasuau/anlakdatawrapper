import get from '@datawrapper/shared/get';
import set from '@datawrapper/shared/set';

export default [
    metadata => {
        const oldVal = get(metadata, 'publish.blocks.logo');
        if (typeof oldVal === 'boolean') {
            set(metadata, 'publish.blocks.logo', { enabled: oldVal });
        }
    }
];
