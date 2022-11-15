const Joi = require('joi');
const Boom = require('@hapi/boom');
const { prepareChart } = require('../../../utils/index.js');
const { createChart, findChartId, translate } = require('@datawrapper/service-utils');
const { Team, ChartPublic, ReadonlyChart } = require('@datawrapper/orm/models');
const cloneDeep = require('lodash/cloneDeep');

// copy from plugins/social-sharing/src/v2/SharingSettings.html
function getDirectChartUrl({ id }) {
    return `https://www.datawrapper.de/_/${id}`;
}

module.exports = server => {
    const { event, events } = server.app;

    // POST /v3/charts/{id}/copy
    server.route({
        method: 'POST',
        path: '/copy',
        options: {
            tags: ['api'],
            description: 'Copies a chart',
            notes: 'Requires scope `chart:write`.',
            auth: {
                strategy: 'guest',
                access: { scope: ['chart:write'] }
            },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required()
                })
            }
        },
        async handler(request, h) {
            const { server, params, auth, headers } = request;
            const { session } = auth.credentials;
            let srcChart = await ReadonlyChart.fromChart(await server.methods.loadChart(params.id));
            const isAdmin = server.methods.isAdmin(request);
            const user = auth.artifacts;
            const isEditable = await srcChart.isEditableBy(user, auth.credentials.session);
            let editInDatawrapper = false;

            if (!isEditable && !isAdmin) {
                const team = await Team.findByPk(srcChart.organization_id);
                editInDatawrapper = team && team.settings.chartTemplates;
                if (!editInDatawrapper) {
                    return Boom.unauthorized();
                } else {
                    const publicSrcChart = await ChartPublic.findByPk(srcChart.id);
                    if (!publicSrcChart) return Boom.notFound();
                    srcChart = await ReadonlyChart.fromPublicChart(srcChart, publicSrcChart);
                }
            }

            if (srcChart.isFork) {
                return Boom.badRequest('You cannot duplicate a forked chart.');
            }

            const newChartId = await findChartId(server);
            const newChartData = {
                type: srcChart.type,
                title: editInDatawrapper
                    ? srcChart.title
                    : `${srcChart.title} (${translate('copy', {
                          scope: 'core',
                          language: auth.artifacts.language
                      })})`,
                metadata: cloneDeep(srcChart.metadata),
                theme: srcChart.theme,
                language: srcChart.language,
                teamId: srcChart.organization_id,
                folderId: srcChart.in_folder,
                external_data: srcChart.external_data,

                forked_from: srcChart.id,
                author_id: user.id,

                last_edit_step: 3
            };

            if ((isAdmin && srcChart.author_id !== user.id) || editInDatawrapper) {
                newChartData.teamId = null;
                newChartData.folderId = null;
            }

            if (
                !srcChart.metadata?.visualize?.sharing?.auto &&
                srcChart.metadata?.visualize?.sharing?.url === getDirectChartUrl(srcChart)
            ) {
                newChartData.metadata.visualize.sharing.url = getDirectChartUrl({ id: newChartId });
            }

            const chart = await createChart(
                {
                    server,
                    user,
                    payload: newChartData,
                    session
                },
                newChartId
            );
            await server.methods.copyChartAssets(srcChart, chart);

            try {
                // refresh external data
                await server.inject({
                    url: `/v3/charts/${chart.id}/data/refresh`,
                    method: 'POST',
                    auth,
                    headers
                });
            } catch (ex) {
                server.logger.debug(
                    `Error while injecting POST /v3/charts/${chart.id}/data/refresh request`,
                    ex
                );
            }

            // log chart/copy
            await request.server.methods.logAction(user.id, `chart/copy`, chart.id);

            await events.emit(event.CHART_COPY, { sourceChart: srcChart, destChart: chart });
            await server.methods.logAction(user.id, `chart/edit`, chart.id);
            return h.response({ ...(await prepareChart(chart)) }).code(201);
        }
    });
};
