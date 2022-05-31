const Joi = require('joi');
const Boom = require('@hapi/boom');
const { prepareChart } = require('../../../utils/index.js');
const { translate } = require('@datawrapper/service-utils/l10n');
const findChartId = require('@datawrapper/service-utils/findChartId');
const { User, Team, ChartPublic, ReadonlyChart } = require('@datawrapper/orm/models');
const clone = require('lodash/clone');
const createChart = require('@datawrapper/service-utils/createChart');

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
            const user = await User.findByPk(auth.artifacts.id);
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

            const newChart = {
                id: await findChartId(server),
                type: srcChart.type,
                title: editInDatawrapper
                    ? srcChart.title
                    : `${srcChart.title} (${translate('copy', {
                          scope: 'core',
                          language: auth.artifacts.language
                      })})`,
                metadata: clone(srcChart.metadata),
                theme: srcChart.theme,
                language: srcChart.language,
                teamId: srcChart.organization_id,
                folderId: srcChart.in_folder,
                external_data: srcChart.external_data,

                forked_from: srcChart.id,
                author_id: user.id,

                last_edit_step: 3
            };

            if (isAdmin || editInDatawrapper) {
                newChart.teamId = null;
                newChart.folderId = null;
            }

            const chart = await createChart({ server, user, payload: newChart, session });
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
