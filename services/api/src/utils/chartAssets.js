const fs = require('fs-extra');
const path = require('path');
const CodedError = require('@datawrapper/service-utils/CodedError.js');

module.exports = {
    name: 'utils/chart-assets',
    version: '1.0.0',
    register: async server => {
        const { events, event } = server.app;

        const { general } = server.methods.config();
        const { localChartAssetRoot } = general;
        const registeredEvents = events.eventNames();
        const hasRegisteredDataPlugins =
            registeredEvents.includes(event.GET_CHART_ASSET) &&
            registeredEvents.includes(event.PUT_CHART_ASSET);

        if (localChartAssetRoot === undefined && !hasRegisteredDataPlugins) {
            server.logger.error(
                '[Config] You need to configure `general.localChartAssetRoot` or install a plugin that implements chart asset storage.'
            );
            process.exit(1);
        }

        if (!hasRegisteredDataPlugins) {
            // register fallback implementation for chart asset read/write
            events.on(event.GET_CHART_ASSET, async function ({ chart, filename }) {
                const filePath = path.join(
                    localChartAssetRoot,
                    getDataPath(chart.createdAt),
                    filename
                );
                try {
                    await fs.access(filePath, fs.constants.R_OK);
                } catch (e) {
                    throw new CodedError('notFound', 'The local chart asset was not found');
                }
                return fs.createReadStream(filePath);
            });

            events.on(event.PUT_CHART_ASSET, async function ({ chart, data, filename }) {
                const outPath = path.join(localChartAssetRoot, getDataPath(chart.createdAt));
                await fs.mkdir(outPath, { recursive: true });
                await fs.writeFile(path.join(outPath, filename), data);
                return { code: 204 };
            });
        }

        // better not include the new delete event in hasRegisteredDataPlugins,
        // in case we forgot to implement it somewhere
        if (!registeredEvents.includes(event.DELETE_CHART_ASSET)) {
            events.on(event.DELETE_CHART_ASSET, async function ({ chart, filename }) {
                const outPath = path.join(localChartAssetRoot, getDataPath(chart.createdAt));
                const fullPath = path.join(outPath, filename);

                const exists = await fs.pathExists(fullPath);

                if (!exists) {
                    return { code: 204 };
                }

                try {
                    await fs.access(outPath, fs.constants.W_OK);
                } catch (e) {
                    throw new CodedError(
                        'notWritable',
                        'Need write access to containing directory.'
                    );
                }

                try {
                    await fs.remove(fullPath);
                } catch (e) {
                    throw new CodedError('deleteFailed', 'Failed to delete the asset');
                }

                return { code: 200 };
            });
        }

        /**
         * read an asset for a given chart
         *
         * @param {Object} opts
         * @param {Chart} opts.chart instance of a Chart or ReadonlyChart
         * @param {string} opts.filename asset filename
         * @param {boolean} [opts.asStream=false] set to true to return raw content stream
         * @param {boolean} [opts.throwNotFound=false] set to true to throw error in case the asset isn't found
         * @returns
         */
        async function getChartAsset({ chart, filename, asStream, throwNotFound }) {
            try {
                const stream = await events.emit(
                    event.GET_CHART_ASSET,
                    {
                        chart,
                        filename: filename
                    },
                    { filter: 'first' }
                );
                if (asStream) return stream;

                let data = '';
                for await (const chunk of stream) {
                    data += chunk;
                }
                return data;
            } catch (error) {
                if (error.name === 'CodedError' && error.code === 'notFound' && !throwNotFound) {
                    // Do nothing when the chart asset was not found.
                    return;
                }
                throw error;
            }
        }

        async function putChartAsset({ chart, data, filename }) {
            return await events.emit(
                event.PUT_CHART_ASSET,
                {
                    chart,
                    data,
                    filename
                },
                { filter: 'first' }
            );
        }

        async function copyChartAssets(srcChart, chart, copyPublic = false) {
            const assets = ['.csv', '.map.json', '.minimap.json', '.highlight.json'];
            for (const filename of assets) {
                try {
                    const data = await getChartAsset({
                        chart: srcChart,
                        filename:
                            srcChart.id +
                            (filename === '.csv' && copyPublic ? '.public.csv' : filename)
                    });
                    if (!data) {
                        // Do nothing when the chart asset was not found.
                        continue;
                    }

                    await putChartAsset({
                        chart,
                        filename: chart.id + filename,
                        data
                    });
                } catch (ex) {
                    console.error(ex);
                    continue;
                }
            }
        }

        // mind the 's'
        async function deleteChartAssets({ chart }) {
            // for safety reasons assets can only be deleted for deleted charts
            if (!chart.deleted) {
                return [{ status: 'forbidden', data: { code: 403 } }];
            }

            const extensions = ['.csv', '.map.json', '.minimap.json', '.highlight.json'];
            const codes = await Promise.all(
                extensions.map(async extension => {
                    try {
                        const res = await events.emit(
                            event.DELETE_CHART_ASSET,
                            {
                                chart,
                                filename: chart.id + extension
                            },
                            { filter: 'first' }
                        );
                        return res.code;
                    } catch (ex) {
                        console.error(ex);
                        return 500;
                    }
                })
            );

            // return either:
            // - the first error code if there were errors
            // - code 204 if no assets were deleted
            // - code 200 in all other cases (if at least one asset was deleted)
            const nonEmptyCodes = codes.filter(code => code !== 204);
            if (!nonEmptyCodes.length) {
                return { code: 204 };
            }

            return {
                code: nonEmptyCodes.find(code => code >= 400) ?? 200
            };
        }

        server.method('getChartAsset', getChartAsset);
        server.method('putChartAsset', putChartAsset);
        server.method('copyChartAssets', copyChartAssets);
        server.method('deleteChartAssets', deleteChartAssets);
    }
};

function getDataPath(date) {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
}
