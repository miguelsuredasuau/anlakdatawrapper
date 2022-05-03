/* eslint-env node, es6 */
import path from 'path';
import less from 'less';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const targets = [];

build('upload');
build('describe');
build('publish');
build('publish/sidebar', { noAMD: true });
build('publish/guest');
build('publish/pending-activation');
build('account/profile', { view: 'EditProfile' });
build('account/myteams', { view: 'MyTeams' });
build('account/security', { view: 'Security' });
build('team-settings/members', { view: 'tabs/Members' });
build('team-settings/settings', { view: 'tabs/Settings' });
build('team-settings/archive', { view: 'tabs/Archive' });
build('team-settings/delete', { view: 'tabs/DeleteTeam' });
build('team-settings/download', { view: 'tabs/Download' });
build('team-settings/products', { view: 'tabs/ProductTable' });

export default targets;

function build(appId, opts) {
    const { noAMD, entry, append, view } = Object.assign(
        {
            noAMD: false,
            entry: 'main.js',
            view: 'App',
            append: ''
        },
        opts
    );
    if (!checkTarget(appId)) return;

    targets.push({
        input: `${opts && opts.view ? appId.split('/')[0] : appId}/${entry}`,
        external: [
            'Handsontable',
            'dayjs',
            /cm\/.*/, // ← CodeMirror + plugins
            /\/static\.*/ // ← legacy vendor code and other static assets required at runtime
        ],
        output: {
            sourcemap: !production,
            name: appId,
            file: `../../static/js/svelte2/${appId}${append}.js`,
            format: 'umd',
            amd: noAMD ? undefined : { id: `svelte/${appId}${append}` },
            globals: {
                Handsontable: 'HOT',
                dayjs: 'dayjs',
                'cm/lib/codemirror': 'CodeMirror',
                '/static/vendor/jschardet/jschardet.min.js': 'jschardet',
                '/static/js/svelte/publish.js': 'Publish'
            }
        },
        plugins: [
            replace({
                __view__: `./${view}.html`
            }),
            svelte({
                dev: !production,
                css: css => {
                    css.write(`../../static/css/svelte2/${appId}${append}.css`);
                },
                cascade: false,
                store: true,
                preprocess: {
                    style: ({ content, attributes }) => {
                        if (attributes.lang !== 'less') return;
                        return new Promise((resolve, reject) => {
                            less.render(
                                content,
                                {
                                    data: content,
                                    includePaths: ['src'],
                                    sourceMap: !production
                                },
                                (err, result) => {
                                    if (err) return reject(err);

                                    resolve({
                                        code: result.css.toString(),
                                        ...(!production ? { map: result.map.toString() } : {})
                                    });
                                }
                            );
                        });
                    }
                }
            }),

            resolve(),
            commonjs(),
            json(),

            /* hack to fix recursion problem caused by transpiling twice
             * https://github.com/rollup/rollup-plugin-babel/issues/252#issuecomment-421541785
             */
            replace({
                delimiters: ['', ''],
                '_typeof2(Symbol.iterator)': 'typeof Symbol.iterator',
                '_typeof2(obj);': 'typeof obj;',
                preventAssignment: true
            }),
            production && terser()
        ],
        onwarn: handleWarnings
    });
}

function checkTarget(appId) {
    if (!process.env.TARGET) return true;
    return process.env.TARGET.endsWith('/')
        ? appId.startsWith(process.env.TARGET)
        : process.env.TARGET === appId;
}

function handleWarnings(warning) {
    // Silence circular dependency warning for d3 packages
    if (
        warning.code === 'CIRCULAR_DEPENDENCY' &&
        !warning.importer.indexOf(path.normalize('node_modules/d3'))
    ) {
        return;
    }
    console.warn(`(!) ${warning.message}`);
}
