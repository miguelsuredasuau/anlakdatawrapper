const Joi = require('joi');
const Boom = require('@hapi/boom');
const ReadonlyChart = require('@datawrapper/orm/models/ReadonlyChart');
const { Op } = require('@datawrapper/orm').db;
const { Chart, ChartPublic, User, Folder } = require('@datawrapper/orm/models');
const { getUserData, setUserData } = require('@datawrapper/orm/utils/userData');
const uniq = require('lodash/uniq');
const set = require('lodash/set');
const get = require('lodash/get');
const isEqual = require('lodash/isEqual');
const cloneDeep = require('lodash/cloneDeep');
const assignWithEmptyObjects = require('../../../utils/assignWithEmptyObjects');
const { camelizeKeys, decamelizeKeys } = require('humps');
const {
    getAdditionalMetadata,
    isValidMySQLJSON,
    prepareChart
} = require('../../../utils/index.js');
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
                    strategy: 'guest',
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
                .custom(v => {
                    if (!isValidMySQLJSON(v)) {
                        throw new Error('Invalid JSON');
                    }
                    return v;
                })
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
                    strategy: 'guest',
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
                    strategy: 'guest',
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
        attributes: [
            'author_id',
            'created_at',
            'createdAt',
            'external_data',
            'forkable',
            'forked_from',
            'id',
            'in_folder',
            'is_fork',
            'language',
            'last_edit_step',
            'last_modified_at',
            'metadata',
            'organization_id',
            'public_url',
            'public_version',
            'published_at',
            'theme',
            'title',
            'type'
        ],
        where: {
            id: params.id,
            deleted: { [Op.not]: true }
        }
    };

    set(options, ['include'], [{ model: User, attributes: ['name', 'email'] }]);

    await server.app.events.emit(server.app.event.EXTEND_LIST_CHART_OPTIONS, {
        options,
        request
    });

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
    const { params, payload, auth, url, server } = request;
    const { metadata, ...payloadWithoutMetadata } = payload;
    const camelizedPayload = {
        ...camelizeKeys(payloadWithoutMetadata),
        ...(metadata && { metadata }) // make sure the 'metadata' value is not undefined
    };
    const user = auth.artifacts;
    const isAdmin = server.methods.isAdmin(request);

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

    if (
        camelizedPayload.organizationId &&
        !isAdmin &&
        !(await user.hasActivatedTeam(payload.organizationId))
    ) {
        return Boom.unauthorized('User does not have access to the specified team.');
    }

    if (camelizedPayload && camelizedPayload.type) {
        // validate chart type
        if (!server.app.visualizations.has(camelizedPayload.type)) {
            return Boom.badRequest('Invalid chart type');
        }
    }

    const folderId = camelizedPayload.folderId || camelizedPayload.inFolder;
    if (folderId) {
        // check if folder belongs to user to team
        const folder = await Folder.findOne({ where: { id: folderId } });

        if (
            !folder ||
            (!isAdmin &&
                folder.user_id !== auth.artifacts.id &&
                !(await user.hasActivatedTeam(folder.org_id)))
        ) {
            throw Boom.unauthorized(
                'User does not have access to the specified folder, or it does not exist.'
            );
        }
        camelizedPayload.inFolder = camelizedPayload.folderId;
        camelizedPayload.folderId = undefined;
        camelizedPayload.organizationId = folder.org_id ? folder.org_id : null;
    }

    if ('authorId' in camelizedPayload && !isAdmin) {
        delete camelizedPayload.authorId;
    }

    if ('isFork' in camelizedPayload && !isAdmin) {
        delete camelizedPayload.isFork;
    }

    // prevent information about earlier publish from being reverted
    if (
        !isNaN(camelizedPayload.publicVersion) &&
        camelizedPayload.publicVersion < chart.public_version
    ) {
        camelizedPayload.publicVersion = chart.public_version;
        camelizedPayload.publicUrl = chart.public_url;
        camelizedPayload.publishedAt = chart.published_at;
        camelizedPayload.lastEditStep = chart.last_edit_step;
        set(
            camelizedPayload,
            'metadata.publish.embed-codes',
            get(chart, 'metadata.publish.embed-codes', {})
        );
    }

    const chartOld = cloneDeep(chart.dataValues);
    const newData = assignWithEmptyObjects(await prepareChart(chart), camelizedPayload);

    if (request.method === 'put' && camelizedPayload.metadata) {
        // in PUT request we replace the entire metadata object
        newData.metadata = camelizedPayload.metadata;
    }

    // check if we have actually changed something
    const chartNew = {
        ...chartOld,
        ...decamelizeKeys(newData),
        metadata: newData.metadata
    };
    const ignoreKeys = new Set(['guest_session', 'public_id', 'created_at']);
    const hasChanged = Object.keys(chartNew).find(
        key =>
            !ignoreKeys.has(key) &&
            !isEqual(chartNew[key], chartOld[key]) &&
            (chartNew[key] || chartOld[key])
    );

    if (hasChanged) {
        // only update and log edit if something has changed
        await Chart.update(
            { ...decamelizeKeys(newData), metadata: newData.metadata },
            { where: { id: chart.id }, limit: 1 }
        );
        await chart.reload();

        // log chart/edit
        await request.server.methods.logAction(user.id, `chart/edit`, chart.id);

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
                        JSON.stringify(uniq([chart.id, ...recentlyEdited]).slice(0, 500))
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
