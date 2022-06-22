const path = require('path');
const { readdir } = require('fs').promises;
const fastGlob = require('fast-glob');
const { Op } = require('@datawrapper/orm').db;
const { Chart, Theme } = require('@datawrapper/orm/models');
const { getInfo } = require('@el3um4s/svelte-get-component-info');

module.exports = {
    name: 'routes/hello',
    version: '1.0.0',
    register: async server => {
        server.methods.registerView('hello/Index.svelte');

        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: 'guest',
                async handler(request, h) {
                    // note: in a real-world scenario we would want to cache the icon list
                    // so we don't have to read the file system on every request
                    const iconPath = path.resolve(
                        path.dirname(require.resolve('@datawrapper/icons/package.json')),
                        'src/icons'
                    );
                    const icons = (await readdir(iconPath)).map(file => file.replace('.svg', ''));

                    // pick a random chart
                    const chart = await Chart.findOne({
                        where: {
                            deleted: 0,
                            last_edit_step: {
                                [Op.gt]: 4
                            }
                        },
                        order: [['created_at', 'DESC']]
                    });
                    const theme = await Theme.findByPk(chart.theme);

                    const componentInfos = Object.fromEntries(
                        (
                            await fastGlob(
                                [path.join(__dirname, '../views/_partials', '**/*.svelte')],
                                {
                                    dot: true
                                }
                            )
                        ).map(file => [
                            path.relative(path.join(__dirname, '../views'), file),
                            getInfo(file)
                        ])
                    );

                    return h.view('hello/Index.svelte', {
                        htmlClass: 'has-background-white',
                        props: {
                            icons,
                            magicNumber: 42,
                            componentInfos,
                            chart: chart.toJSON(),
                            theme: theme.toJSON()
                        }
                    });
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/timeout-test',
            options: {
                auth: 'guest',
                async handler(request, h) {
                    return h.view('hello/timeout-test.pug', {});
                }
            }
        });
    }
};
