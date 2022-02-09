const deepmerge = require('deepmerge');
const get = require('lodash/get');
const { getSchemaJSON } = require('@datawrapper/schemas');

module.exports.findDarkModeOverrideKeys = async function (theme = {}) {
    const themeSchema = await getSchemaJSON('themeData');
    const keepUnits = new Set(['hexColor', 'cssColor', 'cssBorder']);
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

        if (obj?.type === 'object') {
            for (const key of Object.keys(obj.keys || {})) {
                walk(obj.keys[key], `${path}${path === '' ? '' : '.'}${key}`);
            }
            const allowedKeys = obj?.patterns?.[0]?.schema?.allow;
            if (allowedKeys) {
                allowedKeys.forEach(key => {
                    walk(obj.patterns[0].rule, `${path}${path === '' ? '' : '.'}${key}`);
                });
            }
        } else {
            const unit = obj?.flags?.unit;
            const metas = obj?.metas || [];

            const overrideInclude = metas.find(d => (d.overrideSupport || []).includes('darkMode'));
            const overrideExclude = metas.find(d => (d.overrideExclude || []).includes('darkMode'));

            if ((keepUnits.has(unit) || overrideInclude) && !overrideExclude) {
                const noInvert = !!metas.find(d => d.noDarkModeInvert);
                if (path.includes('[i]')) {
                    getArrayKeys(path, noInvert);
                } else {
                    out.push({ path, noInvert });
                }
            }

            if (obj?.type === 'array') {
                walk(obj?.items?.[0], `${path}[i]`);
            }
        }
    }

    function getArrayKeys(path, noInvert) {
        const match = path.match(/\[i\]/);
        if (match) {
            for (const i in get(theme.data, path.slice(0, match.index), [])) {
                getArrayKeys(path.replace(/(\[i\])/, `.${i}`), noInvert);
            }
        } else {
            out.push({ path, noInvert });
        }
    }

    return [...out];
};
