const Boom = require('@hapi/boom');
const Joi = require('joi');
const ReadonlyChart = require('@datawrapper/orm/models/ReadonlyChart');
const assignWithEmptyObjects = require('../../../utils/assignWithEmptyObjects.js');
const cloneDeep = require('lodash/cloneDeep');
const isEqual = require('lodash/isEqual');
const set = require('lodash/set');
const uniq = require('lodash/uniq');
const validateChartPayload = require('@datawrapper/service-utils/validateChartPayload.js');
const { Chart, ChartPublic, User } = require('@datawrapper/orm/models');
const { Op } = require('@datawrapper/orm').db;
const { decamelizeKeys } = require('humps');
const { getAdditionalMetadata, prepareChart } = require('../../../utils/index.js');
const { getUserData, setUserData } = require('@datawrapper/orm/utils/userData');
const { noContentResponse, chartResponse } = require('../../../schemas/response');

module.exports = {
    name: 'routes/charts/{id}',
    version: '1.0.0',
    register(server, options) {
        // GET /v3/charts/{id}
        server.route({
            method: 'GET',
            path: '/',
            options: {
                tags: ['api'],
                description: 'Fetch chart metadata',
                notes: `Requires scope \`chart:read\` or \`chart:write\`.`,
                auth: {
                    access: { scope: ['chart:read', 'chart:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string()
                            .length(5)
                            .required()
                            .description('5 character long chart ID.')
                    }),
                    query: Joi.object({
                        published: Joi.boolean()
                    }).unknown(true)
                },
                response: chartResponse
            },
            handler: getChart
        });

        // DELETE /v3/charts/{id}
        server.route({
            method: 'DELETE',
            path: '/',
            options: {
                tags: ['api'],
                description: 'Delete a chart',
                notes: `This action is permanent. Be careful when using this endpoint.
                        If this endpoint should be used in an application (CMS), it is recommended to
                        ask the user for confirmation.  Requires scope \`chart:write\`.`,
                auth: {
                    access: { scope: ['chart', 'chart:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string()
                            .length(5)
                            .required()
                            .description('5 character long chart ID.')
                    })
                },
                response: noContentResponse
            },
            handler: deleteChart
        });

        const editChartPayload = Joi.object({
            title: Joi.string()
                .example('My cool chart')
                .allow('')
                .description('Title of your chart. This will be the chart headline.'),
            theme: Joi.string().example('datawrapper').description('Chart theme to use.'),
            type: Joi.string()
                .example('d3-lines')
                .description(
                    'Type of the chart ([Reference](https://developer.datawrapper.de/v3.0/docs/chart-types))'
                ),
            lastEditStep: Joi.number()
                .integer()
                .example(1)
                .description('Used in the app to determine where the user last edited the chart.'),
            folderId: Joi.number().allow(null).optional(),
            organizationId: Joi.string().allow(null).optional(),
            metadata: Joi.object({
                data: Joi.object({
                    transpose: Joi.boolean()
                }).unknown(true)
            })
                .description('Metadata that saves all chart specific settings and options.')
                .unknown(true)
        }).unknown();

        // PATCH /v3/charts/{id}
        server.route({
            method: 'PATCH',
            path: '/',
            options: {
                tags: ['api'],
                description:
                    'Update chart. Allows for partial metadata updates (JSON merge patch).  Requires scope `chart:write`.',
                auth: {
                    access: { scope: ['chart:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string()
                            .length(5)
                            .required()
                            .description('5 character long chart ID.')
                    }),
                    payload: editChartPayload
                },
                response: chartResponse
            },
            handler: editChart
        });

        // PUT /v3/charts/{id}
        server.route({
            method: 'PUT',
            path: '/',
            options: {
                tags: ['api'],
                description:
                    'Update chart. Replaces the entire metadata object.  Requires scope `chart:write`.',
                auth: {
                    access: { scope: ['chart:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string()
                            .length(5)
                            .required()
                            .description('5 character long chart ID.')
                    }),
                    payload: editChartPayload
                },
                response: chartResponse
            },
            handler: editChart
        });

        require('./assets')(server, options);
        require('./data')(server, options);
        require('./embed-codes')(server, options);
        require('./export')(server, options);
        require('./publish')(server, options);
        require('./unpublish')(server, options);
        require('./copy')(server, options);
        require('./fork')(server, options);
    }
};

async function getChart(request) {
    const { url, query, params, auth, server } = request;

    const options = {
        where: {
            id: params.id,
            deleted: { [Op.not]: true }
        }
    };

    set(options, ['include'], [{ model: User, attributes: ['name', 'email'] }]);

    const chart = await Chart.findOne(options);

    if (!chart) {
        return Boom.notFound();
    }

    const isEditable = await chart.isEditableBy(auth.artifacts, auth.credentials.session);

    let readonlyChart;
    if (query.published || !isEditable) {
        if (!isEditable) delete chart.dataValues.user;
        if (chart.published_at) {
            const publicChart = await ChartPublic.findByPk(chart.id);
            if (!publicChart) {
                throw Boom.notFound();
            }
            readonlyChart = await ReadonlyChart.fromPublicChart(chart, publicChart);
        } else {
            return Boom.unauthorized();
        }
    } else {
        readonlyChart = await ReadonlyChart.fromChart(chart);
    }

    const additionalData = await getAdditionalMetadata(readonlyChart, { server });

    if (server.methods.config('general').imageDomain) {
        additionalData.thumbnails = {
            full: `//${server.methods.config('general').imageDomain}/${
                readonlyChart.id
            }/${readonlyChart.getThumbnailHash()}/full.png`,
            plain: `//${server.methods.config('general').imageDomain}/${
                readonlyChart.id
            }/${readonlyChart.getThumbnailHash()}/plain.png`
        };
    }

    return {
        ...(await prepareChart(readonlyChart, additionalData)),
        url: `${url.pathname}`
    };
}

async function editChart(request) {
    const { auth, params, payload, server, url } = request;
    const { session, token } = auth.credentials;
    const user = auth.artifacts;
    const { Op } = server.methods.getDB();
    const Chart = server.methods.getModel('chart');

    const chart = await Chart.findOne({
        where: {
            id: params.id,
            deleted: { [Op.not]: true }
        }
    });

    if (!chart) {
        return Boom.notFound();
    }

    const isEditable = await chart.isEditableBy(auth.artifacts, auth.credentials.session);

    if (!isEditable) {
        return Boom.unauthorized();
    }

    const { validatedPayload } = await validateChartPayload({
        chart,
        server,
        payload: decamelizeKeys(payload),
        session,
        token,
        user
    });

    const newDataValues = assignWithEmptyObjects(cloneDeep(chart.dataValues), validatedPayload);

    if (request.method === 'put' && validatedPayload.metadata) {
        // in PUT request we replace the entire metadata object
        newDataValues.metadata = validatedPayload.metadata;
    }

    // check if we have actually changed something
    const ignoreKeys = new Set(['guest_session', 'public_id', 'created_at']);
    const hasChanged = Object.keys({ ...chart.dataValues, ...newDataValues }).find(
        key =>
            !ignoreKeys.has(key) &&
            (chart.dataValues[key] || newDataValues[key]) &&
            !isEqual(chart.dataValues[key], newDataValues[key])
    );

    if (hasChanged) {
        // only update and log edit if something has changed
        await Chart.update(newDataValues, { where: { id: chart.id }, limit: 1 });
        await chart.reload();

        // log chart/edit
        await request.server.methods.logAction(user.id, 'chart/edit', chart.id);

        if (user.role !== 'guest') {
            // log recently edited charts
            try {
                const recentlyEdited = JSON.parse(
                    await getUserData(user.id, 'recently_edited', '[]')
                );
                if (recentlyEdited[0] !== chart.id) {
                    await setUserData(
                        user.id,
                        'recently_edited',
                        JSON.stringify(uniq([chart.id, ...recentlyEdited]).slice(0, 100))
                    );
                }
            } catch (err) {
                request.logger.error(`Broken user_data 'recently_edited' for user [${user.id}]`);
            }
        }
    }

    return {
        ...(await prepareChart(chart)),
        url: `${url.pathname}`
    };
}

async function deleteChart(request, h) {
    const { auth, server, params } = request;
    const options = {
        where: {
            id: params.id,
            deleted: {
                [Op.not]: true
            }
        }
    };

    const chart = await Chart.findOne(options);

    if (!chart) return Boom.notFound();

    if (
        !server.methods.isAdmin(request) &&
        !(await chart.isEditableBy(auth.artifacts, auth.credentials.session))
    ) {
        return Boom.forbidden();
    }

    await chart.update({
        deleted: true,
        deleted_at: new Date()
    });

    await server.app.events.emit(server.app.event.CHART_DELETED, {
        chart,
        user: auth.artifacts
    });

    return h.response().code(204);
}
