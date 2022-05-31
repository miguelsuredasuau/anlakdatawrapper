const { Chart } = require('@datawrapper/orm/models');
const Joi = require('joi');
const { getUserData } = require('@datawrapper/orm/utils/userData');
const { chartListResponse } = require('../../../utils/schemas');
const { Op } = require('@datawrapper/orm').db;
const { prepareChart, GET_CHARTS_ATTRIBUTES } = require('../../../utils/index.js');

module.exports = async server => {
    // GET /v3/users/:id/recently-edited-charts
    // GET /v3/users/:id/recently-published-charts

    ['edited', 'published'].forEach(type => {
        server.route({
            method: 'GET',
            path: `/recently-${type}-charts`,
            options: {
                tags: ['api'],
                description: `Get a list of recently ${type} charts`,
                notes: 'Requires scopes `user:read` and `chart:read`.',
                auth: {
                    access: { scope: ['user:read', 'chart:read'] }
                },
                response: chartListResponse,
                validate: {
                    params: {
                        id: Joi.number().required().description('User ID')
                    },
                    query: {
                        limit: Joi.number()
                            .integer()
                            .min(1)
                            .default(100)
                            .description('Maximum items to fetch. Useful for pagination.'),
                        offset: Joi.number()
                            .integer()
                            .min(0)
                            .default(0)
                            .description('Number of items to skip. Useful for pagination.')
                    }
                }
            },
            handler: getRecentChartHandler(type)
        });
    });
};

function getRecentChartHandler(type) {
    return async function (request) {
        const { auth, params } = request;
        const userId = params.id;

        await request.server.methods.userIsDeleted(userId);

        if (userId !== auth.artifacts.id) {
            request.server.methods.isAdmin(request, { throwError: true });
        }

        const { events, event } = request.server.app;
        const { offset, limit } = request.query;
        const general = request.server.methods.config('general');
        const chartIds = JSON.parse(await getUserData(userId, `recently_${type}`, '[]'));

        const options = {
            attributes: GET_CHARTS_ATTRIBUTES,
            where: {
                ...(!request.server.methods.isAdmin(request)
                    ? {
                          [Op.or]: [
                              { author_id: auth.artifacts.id },
                              { organization_id: await auth.artifacts.getActiveTeamIds() }
                          ]
                      }
                    : {}),
                ...(type === 'published' ? { published_at: { [Op.not]: null } } : {}),
                id: chartIds,
                deleted: false
            },
            order: [[type === 'edited' ? 'last_modified_at' : 'published_at', 'DESC']],
            limit,
            offset
        };
        await events.emit(event.EXTEND_LIST_CHART_OPTIONS, {
            options,
            request
        });
        const { count = 0, rows = [] } = await Chart.findAndCountAll(options);
        const charts = [];

        for (const chart of rows) {
            charts.push({
                ...(await prepareChart(chart)),
                thumbnails: general.imageDomain
                    ? {
                          full: `//${general.imageDomain}/${
                              chart.id
                          }/${chart.getThumbnailHash()}/full.png`,
                          plain: `//${general.imageDomain}/${
                              chart.id
                          }/${chart.getThumbnailHash()}/plain.png`
                      }
                    : undefined,
                url: `/v3/charts/${chart.id}`
            });
        }
        return {
            total: count,
            list: charts,
            next:
                count > offset + limit
                    ? `${
                          request._isInjected
                              ? request.path.replace(/^\/v3\/users\/\d+/, '/v3/me')
                              : request.path
                      }?offset=${limit + offset}&limit=${limit}`
                    : undefined
        };
    };
}
