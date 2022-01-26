const deepmerge = require('deepmerge');
const get = require('lodash/get');
const { getSchemaJSON } = require('@datawrapper/schemas');

module.exports.findDarkModeOverrideKeys = async function (theme = {}) {
    const themeSchema = await getSchemaJSON('themeData');
    const keepUnits = new Set(['hexColor', 'cssColor', 'cssBorder', 'colorArray']);
    const out = [];
    const refs = [];

    walk(themeSchema, '');

    function walk(obj, path) {
        if (obj?.shared) refs.unshift(...obj.shared);
        if (obj?.type === 'link') {
            const id = obj.link.ref.path[0];
            const ref = refs.find(({ flags }) => flags.id === id);
            if (obj.whens) {
                const concattedSchemas = obj.whens.map(({ concat }) => concat).filter(Boolean);
                obj = ref;
                concattedSchemas.forEach(concattedSchema => {
                    obj = deepmerge(obj, concattedSchema);
                });
            } else {
                obj = ref;
            }
        }

        if (obj?.type === 'object' && obj.keys) {
            for (const key of Object.keys(obj.keys)) {
                walk(obj.keys[key], `${path}${path === '' ? '' : '.'}${key}`);
            }
        } else {
            const unit = obj?.flags?.unit;
            const metas = obj?.metas || [];
            const overrideInclude = metas.find(d => (d.overrideSupport || []).includes('darkMode'));
            if (keepUnits.has(unit) || overrideInclude) {
                out.push({ path, noInvert: metas.find(d => d.noDarkModeInvert) });
            }
        }
    }

    get(theme, 'data.colors.gradients', []).forEach((g, i) => {
        out.push({ path: `colors.gradients.${i}` });
    });
    get(theme, 'data.colors.categories', []).forEach((g, i) => {
        out.push({ path: `colors.categories.${i}` });
    });

    return [...out];
};
