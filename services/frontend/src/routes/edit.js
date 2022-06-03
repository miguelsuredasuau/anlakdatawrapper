const Boom = require('@hapi/boom');
const Joi = require('joi');
const get = require('lodash/get');
const set = require('lodash/set');
const { getNestedObjectKeys } = require('../utils');
const { Op } = require('@datawrapper/orm').db;
const { Chart, User, Folder, Team } = require('@datawrapper/orm/models');
const prepareChart = require('@datawrapper/service-utils/prepareChart');
const assign = require('assign-deep');

module.exports = {
    name: 'routes/edit',
    version: '1.0.0',
    register: async server => {
        server.methods.registerView('edit/Index.svelte');

        //
        // allow plugins to register additional workflows
        //
        const editWorkflows = [];
        const editWorkflowSteps = new Map();
        const defaultWorkflowOptions = {
            /**
             * set to true to hide chart type selector in visualize step
             */
            hideChartTypeSelector: false,
            /**
             * list other workflow ids to include more visualizations
             * in the chart type selector
             */
            includeInChartTypeSelector: []
        };
        server.method('registerEditWorkflow', workflow => {
            workflow.options = { ...defaultWorkflowOptions, ...(workflow.options || {}) };
            editWorkflows.push(workflow);
            workflow.steps.forEach(step => {
                editWorkflowSteps.set(`${workflow.id}.${step.id}`, step);
            });
        });

        // register default chart workflow
        server.methods.registerEditWorkflow({
            id: 'chart',
            prefix: 'chart',
            steps: [
                {
                    id: 'upload',
                    view: 'edit/chart/upload',
                    title: ['Upload Data', 'core'],
                    async data({ request, chart }) {
                        const datasets = await server.methods.getDemoDatasets({ request, chart });
                        const uploadAfterContent = await server.methods.getCustomHTML(
                            'edit/upload/afterContent',
                            { request }
                        );
                        const additionalData = await server.methods.getCustomData('edit/upload', {
                            request
                        });
                        return {
                            datasets,
                            uploadAfterContent,
                            ...additionalData
                        };
                    }
                },
                {
                    id: 'describe',
                    view: 'edit/chart/describe',
                    title: ['Check & Describe', 'core'],
                    async data({ request, chart, team }) {
                        let showLocaleSelect = true;
                        if (team && team.settings?.flags?.output_locale === false) {
                            showLocaleSelect = false;
                        }
                        return {
                            showLocaleSelect,
                            readonly: !(await chart.isDataEditableBy(
                                request.auth.artifacts,
                                request.auth.credentials.session
                            ))
                        };
                    }
                },
                {
                    id: 'visualize',
                    view: 'edit/chart/visualize',
                    title: ['Visualize', 'core'],
                    async data({ team }) {
                        const { controls, previewWidths, customFields } = {
                            controls: {},
                            previewWidths: [],
                            customFields: [],
                            ...team?.settings
                        };
                        return {
                            teamSettings: {
                                controls,
                                previewWidths,
                                customFields
                            }
                        };
                    }
                },
                {
                    id: 'publish',
                    view: 'edit/chart/publish',
                    title: ['Publish & Embed', 'core'],
                    async data({ request, chart, theme }) {
                        const { svelte2: afterEmbed } = await server.methods.getCustomData(
                            'edit/publish/afterEmbed',
                            {
                                request,
                                chart
                            }
                        );
                        const guestAboveInvite = await server.methods.getCustomHTML(
                            'edit/publish/guestAboveInvite',
                            { request }
                        );
                        const guestBelowInvite = await server.methods.getCustomHTML(
                            'edit/publish/guestBelowInvite',
                            { request }
                        );
                        const api = server.methods.createAPI(request);
                        // fetch embed types from API
                        const embedTemplates = await api(`/charts/${chart.id}/embed-codes`);
                        const embedType = (
                            embedTemplates.find(tpl => tpl.preferred) || { id: 'responsive ' }
                        ).id;
                        // fetch display urls from API
                        const displayURLs = await api(`/charts/${chart.id}/display-urls`);

                        const chartActions = await server.methods.getChartActions({
                            request,
                            chart,
                            theme
                        });

                        return {
                            afterEmbed,
                            guestAboveInvite,
                            guestBelowInvite,
                            embedTemplates,
                            embedType,
                            displayURLs,
                            chartActions,
                            needsRepublish:
                                chart.last_edit_step > 4 &&
                                chart.last_modified_at - chart.published_at > 20000
                        };
                    }
                }
            ]
        });

        // register view components for chart workflow
        server.methods.registerViewComponent({
            id: 'edit/chart/upload',
            page: 'edit/Index.svelte',
            view: 'edit/steps/Upload.svelte'
        });

        server.methods.registerViewComponent({
            id: 'edit/chart/describe',
            page: 'edit/Index.svelte',
            view: 'edit/steps/Describe.svelte'
        });

        server.methods.registerViewComponent({
            id: 'edit/chart/visualize',
            page: 'edit/Index.svelte',
            view: 'edit/steps/Visualize.svelte'
        });

        server.methods.registerViewComponent({
            id: 'edit/chart/publish',
            page: 'edit/Index.svelte',
            view: 'edit/steps/Publish.svelte'
        });

        server.route({
            method: 'GET',
            path: '/v2/{prefix}/{chartId}/{step?}',
            options: {
                validate: {
                    params: Joi.object({
                        prefix: Joi.string().valid('edit', 'chart', 'map', 'table'),
                        chartId: Joi.string()
                            .alphanum()
                            .length(5)
                            .required()
                            .description('5 character long chart ID.'),
                        step: Joi.string().alphanum()
                    })
                },
                auth: 'guest',
                async handler(request, h) {
                    const { params } = request;
                    const chart = await getChart(params.chartId, request);

                    const vis = server.app.visualizations.get(chart.type);
                    const workflow = editWorkflows.find(w => w.id === (vis.workflow || 'chart'));
                    const __ = server.methods.getTranslate(request);

                    let team = null;
                    if (chart.organization_id) {
                        team = await chart.getTeam();
                    }

                    if (!workflow) {
                        throw Boom.notImplemented('unknown workflow ' + vis.workflow);
                    }
                    // allowPrefix is set to 'chart' for d3-maps, for which we (for now) still want to allow access to the chart
                    // upload & describe steps
                    // TODO: remove this hack once new symbol map upload is live
                    if (
                        workflow.prefix &&
                        ![workflow.prefix, workflow.allowPrefix].includes(params.prefix)
                    ) {
                        return h.redirect(`/${workflow.prefix}/${params.chartId}/${params.step}`);
                    }

                    // replace step references with registered steps from other
                    // workflows, so that plugins can re-use core steps
                    // shallow-clone step objects to retain original objects
                    // for future requests
                    const workflowSteps = workflow.steps
                        .map(step => {
                            if (step.ref) {
                                if (editWorkflowSteps.has(step.ref)) {
                                    const workflowStep = { ...editWorkflowSteps.get(step.ref) };
                                    if (step.hide) workflowStep.hide = step.hide;
                                    return workflowStep;
                                }
                                throw Boom.notImplemented(
                                    'unknown workflow step reference: ' + step.ref
                                );
                            }
                            return step;
                        })
                        .map(step => ({ ...step }));

                    if (!workflowSteps.find(step => step.id === params.step)) {
                        params.step = workflow.steps[0];
                    }

                    const api = server.methods.createAPI(request);

                    // refresh external data...
                    if (
                        // ...if the upload method isn't copy-paste or file upload
                        get(chart, 'metadata.data.upload-method') !== 'copy' ||
                        // ...if the chart is in "print mode", which means we want to
                        // synchronize the dataset from the "web mode" chart
                        get(chart, 'metadata.custom.webToPrint.mode') === 'print'
                    ) {
                        await api(`/charts/${chart.id}/data/refresh`, {
                            method: 'POST',
                            json: false
                        });
                    }

                    // load things from API
                    const [theme, data] = await Promise.all([
                        await api(`/themes/${chart.theme}?extend=true`),
                        await api(`/charts/${chart.id}/data`, { json: false })
                    ]);

                    // evaluate data function for each step
                    for (const step of workflowSteps) {
                        // @todo: remove `step.id === params.step` check to pre-load
                        // data for all steps in single-page editor
                        if (step.id === params.step && typeof step.data === 'function') {
                            step.data = await step.data({ request, chart, theme, team });
                        }
                    }

                    const breadcrumbPath = [
                        chart.organization_id
                            ? {
                                  title: (await Team.findByPk(chart.organization_id)).name,
                                  url: `/archive/team/${chart.organization_id}`,
                                  svgIcon: 'folder-shared'
                              }
                            : {
                                  title: __('archive / my-archive'),
                                  url: '/archive',
                                  svgIcon: 'folder-user'
                              }
                    ];
                    // compute breadcrumb path
                    let folderId = chart.in_folder;
                    while (folderId) {
                        const folder = await Folder.findByPk(folderId);
                        breadcrumbPath.splice(1, 0, {
                            title: folder.name,
                            url: `${breadcrumbPath[0].url}/${folder.id}`,
                            svgIcon: 'folder'
                        });
                        folderId = folder.parentId;
                    }

                    const customViews = await server.methods.getCustomData('edit/customViews', {
                        request,
                        chart
                    });

                    const stepIndex =
                        workflowSteps
                            .filter(d => !d.hide)
                            .findIndex(step => step.id === params.step) + 1;

                    if (stepIndex > 0 && stepIndex > chart.last_edit_step) {
                        chart.update({ last_edit_step: stepIndex });
                    }

                    const rawChart = await prepareChart(chart);

                    const disabledFields = await applyExternalMetadata(api, rawChart);

                    // check if this is an admin accessing a chart by someone else
                    const user = request.auth.artifacts;
                    const showAdminWarning =
                        user.isAdmin() &&
                        user.id !== chart.author_id &&
                        !(await user.hasActivatedTeam(chart.organization_id));

                    return h.view('edit/Index.svelte', {
                        htmlClass: 'has-background-white-bis',
                        props: {
                            rawChart,
                            rawData: data,
                            initUrlStep: params.step,
                            urlPrefix: `/${params.prefix}`,
                            breadcrumbPath,
                            workflow: {
                                ...workflow,
                                steps: workflowSteps
                            },
                            theme,
                            visualizations: Array.from(server.app.visualizations.values()),
                            customViews,
                            showEditorNavInCmsMode: get(
                                request.auth.artifacts.activeTeam,
                                'settings.showEditorNavInCmsMode',
                                false
                            ),
                            disabledFields,
                            showAdminWarning
                        }
                    });
                }
            }
        });

        async function getChart(id, request) {
            const isAdmin = server.methods.isAdmin(request);
            const options = {
                where: {
                    id,
                    deleted: { [Op.not]: true }
                }
            };
            if (isAdmin) {
                set(options, ['include'], [{ model: User, attributes: ['id', 'name', 'email'] }]);
            }
            const chart = await Chart.findOne(options);
            const isEditable =
                chart &&
                (await chart.isEditableBy(
                    request.auth.artifacts,
                    request.auth.credentials.session
                ));
            if (!isEditable) {
                throw Boom.notFound("Whoops! We couldn't find that visualization...", {
                    text: `Sorry, but it seems that there is no visualization with the id ${id} (anymore)`
                });
            }
            return chart;
        }
    }
};

/**
 * loads external metadata, applies the changes to rawChart and returns
 * a list of keys that should be readonly because they are now controlled
 * via external metadata
 *
 * @param {object} api  - api instance created with server.methods.createApi()
 * @param {*} rawChart
 * @returns {string[]} - list of readonly chart keys (e.g. "metadata.annotate.notes")
 */
async function applyExternalMetadata(api, rawChart) {
    // load external metadata if defined
    let externalMetadata = {};
    const readonlyFields = []; // fields controlled by external metadata
    if (
        get(rawChart, 'metadata.data.upload-method') === 'external-data' &&
        get(rawChart, 'metadata.data.external-metadata')
    ) {
        try {
            externalMetadata = await api(
                `/charts/${rawChart.id}/assets/${rawChart.id}.metadata.json`
            );
        } catch {
            // external metadata defined, but presumably doesn't point to a valid json
            // so there's no corresponding asset
        }
    }
    // special treatment for title since it's not part of metadata
    // but very useful to set externally in a live context
    if (externalMetadata.title !== undefined) {
        rawChart.title = externalMetadata.title;
        readonlyFields.push('title');
        delete externalMetadata.title;
    }
    readonlyFields.push(...getNestedObjectKeys(externalMetadata).map(key => `metadata.${key}`));
    // assign remaining metadata
    assign(rawChart.metadata, externalMetadata);
    return readonlyFields;
}
